import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { courses } from "./courses";

// Evita que el catálogo del sitio y el de la base de datos se desalineen.
describe("supabase/seed.sql coincide con src/lib/courses.ts", () => {
  const sql = readFileSync("supabase/seed.sql", "utf8");
  const rows = [...sql.matchAll(/^\s*\('([^']+)',.*, (\d+), true, (\d+)\)/gm)].map((m) => ({
    slug: m[1], price: Number(m[2]), order: Number(m[3]),
  }));

  it("tiene las mismas filas, en el mismo orden", () => {
    expect(rows.map((r) => r.slug)).toEqual(courses.map((c) => c.slug));
    expect(rows.map((r) => r.order)).toEqual(courses.map((_, i) => i + 1));
  });

  it("tiene los mismos precios", () => {
    expect(rows.map((r) => r.price)).toEqual(courses.map((c) => c.price));
  });
});
