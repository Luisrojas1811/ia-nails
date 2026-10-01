import { describe, expect, it } from "vitest";
import { courses, formatPrice, getCourse } from "./courses";

describe("catálogo de cursos", () => {
  it("tiene los 5 cursos", () => {
    expect(courses).toHaveLength(5);
  });

  it("no repite slugs y todos son válidos para una URL", () => {
    const slugs = courses.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("cada curso tiene nombre, resumen y un precio entero mayor a cero", () => {
    courses.forEach((c) => {
      expect(c.name.trim()).not.toBe("");
      expect(c.summary.trim()).not.toBe("");
      expect(Number.isInteger(c.price)).toBe(true);
      expect(c.price).toBeGreaterThan(0);
    });
  });

  it("getCourse encuentra por slug y devuelve undefined si no existe", () => {
    expect(getCourse("capping-polygel")?.price).toBe(25000);
    expect(getCourse("no-existe")).toBeUndefined();
  });
});

describe("formatPrice", () => {
  it("formatea en pesos argentinos", () => {
    const normal = (s: string) => s.replace(/\s/g, " ");
    expect(normal(formatPrice(15000))).toBe("$ 15.000");
    expect(normal(formatPrice(8000))).toBe("$ 8.000");
    expect(normal(formatPrice(40000))).toBe("$ 40.000");
  });
});
