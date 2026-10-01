import { describe, expect, it } from "vitest";
import { safeNext } from "./auth";

describe("safeNext (evita redirecciones a otros sitios)", () => {
  it("acepta rutas internas", () => {
    expect(safeNext("/mis-cursos")).toBe("/mis-cursos");
    expect(safeNext("/cursos/capping-polygel?x=1")).toBe("/cursos/capping-polygel?x=1");
  });

  it.each([
    "//evil.com",
    "https://evil.com",
    "http://evil.com/mis-cursos",
    "javascript:alert(1)",
    "/\\evil.com",
    "evil.com",
    "",
  ])("rechaza %j", (value) => {
    expect(safeNext(value)).toBe("/mis-cursos");
  });

  it("rechaza valores que no son texto", () => {
    expect(safeNext(null)).toBe("/mis-cursos");
    expect(safeNext(undefined)).toBe("/mis-cursos");
    expect(safeNext(123)).toBe("/mis-cursos");
  });

  it("usa el destino alternativo cuando se lo piden", () => {
    expect(safeNext("//evil.com", "/actualizar-contrasena")).toBe("/actualizar-contrasena");
  });
});
