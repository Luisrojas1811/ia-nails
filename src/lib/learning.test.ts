import { describe, expect, it } from "vitest";
import { courseProgress, formatDuration, isEnrollmentActive, pickLesson, type Lesson } from "./learning";

const L = (position: number, id = `l${position}`): Lesson => ({ id, position, title: `Clase ${position}`, duration_seconds: 600, is_preview: false });
const lessons = [L(3), L(1), L(2)]; // desordenadas a propósito

describe("isEnrollmentActive", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  it("activa y sin vencimiento: sí", () => expect(isEnrollmentActive({ status: "active", expires_at: null }, now)).toBe(true));
  it("activa con vencimiento futuro: sí", () => expect(isEnrollmentActive({ status: "active", expires_at: "2027-01-01T00:00:00Z" }, now)).toBe(true));
  it("activa pero vencida: no", () => expect(isEnrollmentActive({ status: "active", expires_at: "2026-10-01T00:00:00Z" }, now)).toBe(false));
  it("revocada (reembolso): no", () => expect(isEnrollmentActive({ status: "revoked", expires_at: null }, now)).toBe(false));
});

describe("courseProgress", () => {
  it("cuenta clases vistas y el porcentaje", () => {
    expect(courseProgress(["a", "b", "c", "d"], new Set(["a", "c"]))).toEqual({ total: 4, done: 2, percent: 50 });
  });
  it("sin clases no divide por cero", () => expect(courseProgress([], new Set())).toEqual({ total: 0, done: 0, percent: 0 }));
  it("ignora vistas de otros cursos", () => expect(courseProgress(["a"], new Set(["x", "y"])).done).toBe(0));
});

describe("pickLesson", () => {
  it("sin clases devuelve null", () => expect(pickLesson([], new Set())).toBeNull());
  it("la primera sin ver, en orden de posición", () => {
    expect(pickLesson(lessons, new Set())!.position).toBe(1);
    expect(pickLesson(lessons, new Set(["l1"]))!.position).toBe(2);
  });
  it("si todas están vistas, vuelve a la primera", () => {
    expect(pickLesson(lessons, new Set(["l1", "l2", "l3"]))!.position).toBe(1);
  });
  it("respeta la clase pedida en la URL", () => {
    expect(pickLesson(lessons, new Set(), "3")!.position).toBe(3);
    expect(pickLesson(lessons, new Set(), 2)!.position).toBe(2);
  });
  it.each(["99", "abc", "", null, undefined, "1.5", "-1"])("pedido inválido (%s) cae en la primera sin ver", (req) => {
    expect(pickLesson(lessons, new Set(["l1"]), req as string | null)!.position).toBe(2);
  });
});

describe("formatDuration", () => {
  it.each([[null, ""], [0, ""], [30, "1 min"], [600, "10 min"], [3600, "1 h 00 min"], [3900, "1 h 05 min"]])("%s -> %s", (s, out) => {
    expect(formatDuration(s as number | null)).toBe(out);
  });
});
