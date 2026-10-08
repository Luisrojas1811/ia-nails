import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { courses } from "./courses";
import { site } from "./site";
import { works } from "./works";

const inPublic = (src: string) => existsSync(`public${src}`);

describe("imágenes del sitio", () => {
  it("todas las portadas de cursos existen", () => {
    courses.filter((c) => c.cover).forEach((c) => expect(inPublic(c.cover!), c.cover).toBe(true));
  });
  it("todas las fotos de trabajos existen y tienen texto alternativo", () => {
    works.forEach((w) => { expect(inPublic(w.src), w.src).toBe(true); expect(w.alt.length).toBeGreaterThan(10); });
  });
  it("hay al menos 6 trabajos destacados en la galería", () => {
    expect(works.filter((w) => w.featured).length).toBeGreaterThanOrEqual(6);
  });
  it("el logo existe", () => expect(inPublic("/images/logo.png")).toBe(true));
});

describe("datos de contacto", () => {
  it("el WhatsApp está en formato internacional argentino (549 + 10 dígitos)", () => {
    expect(site.whatsapp).toMatch(/^549\d{10}$/);
  });
  it("el email tiene formato válido", () => {
    expect(site.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
