import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { courseSlugs, parseLine, toSql } from "../../scripts/clases-a-sql.mjs";

const slugs: string[] = courseSlugs(readFileSync("src/lib/courses.ts", "utf8"));
const VID = "0a1b2c3d-4e5f-6789-abcd-ef0123456789";

describe("planilla de clases → SQL", () => {
  it("lee los slugs reales del catálogo", () => expect(slugs).toContain("capping-polygel"));

  it("respeta comillas y comas dentro del título", () => {
    expect(parseLine('a,1,"Uñas, base y ""color""",10,')).toEqual(["a", "1", 'Uñas, base y "color"', "10", ""]);
  });

  it("genera una transacción con la clase y su video", () => {
    const { sql, errors, count } = toSql(`curso,posicion,titulo,minutos,video_id\ncapping-polygel,1,L'esmalte,7.5,${VID}`, slugs);
    expect(errors).toEqual([]);
    expect(count).toBe(1);
    expect(sql).toMatch(/^-- .*\n[\s\S]*begin;[\s\S]*commit;\n$/);
    expect(sql).toContain("'L''esmalte', 450 from public.courses where slug = 'capping-polygel'");
    expect(sql).toContain(`select id, '${VID}' from l`);
    expect(sql).toContain("on conflict (lesson_id) do update");
  });

  it("acepta punto y coma (Excel en español) y clases sin video", () => {
    const { sql, errors } = toSql("curso;posicion;titulo;minutos;video_id\nnail-art-inicial;2;Clase dos;;", slugs);
    expect(errors).toEqual([]);
    expect(sql).toContain("sin video todavía");
    expect(sql).not.toContain("lesson_videos");
  });

  it("frena con errores claros y no genera SQL", () => {
    const { sql, errors } = toSql("curso,posicion,titulo,minutos,video_id\nno-existe,0,,abc,123\ncapping-polygel,1,A,,\ncapping-polygel,1,B,,", slugs);
    expect(sql).toBe("");
    expect(errors.join("\n")).toMatch(/no existe[\s\S]*posición[\s\S]*título[\s\S]*minutos[\s\S]*video_id[\s\S]*repetida/);
  });

  it("el ejemplo de docs es válido", () => {
    expect(toSql(readFileSync("docs/clases-ejemplo.csv", "utf8"), slugs).errors).toEqual([]);
  });
});
