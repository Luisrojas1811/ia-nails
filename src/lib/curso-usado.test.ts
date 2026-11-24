import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { devoluciones, terminos } from "@/content/legal";

// Política elegida por Iara: el curso cuenta como "usado" al abrir la primera clase; reintegro en 7 días.
const read = (f: string) => readFileSync(f, "utf8");

describe("curso usado al abrir la primera clase", () => {
  it("la política de devoluciones lo explica, con el plazo de reintegro", () => {
    const text = JSON.stringify(devoluciones);
    expect(text).toContain("primera clase");
    expect(text).toContain("7 días corridos");
  });

  it("los términos dicen que los precios incluyen impuestos", () => {
    expect(JSON.stringify(terminos)).toContain("incluyen impuestos");
  });

  it("se avisa antes de comprar, junto al botón", () => {
    const page = read("src/app/cursos/[slug]/page.tsx");
    expect(page).toContain("impuestos incluidos");
    expect(page).toMatch(/abrir la primera clase/);
    expect(page).toContain('href="/devoluciones"');
  });

  it("la apertura se registra en el navegador y solo si la clase tiene video", () => {
    expect(read("src/app/mis-cursos/[slug]/page.tsx")).toContain("{embedUrl && <OpenedTracker courseId={course.id} />}");
    const tracker = read("src/components/OpenedTracker.tsx");
    expect(tracker.startsWith('"use client"')).toBe(true);
    expect(tracker).toContain("useEffect");
  });

  it("la base solo deja escribir la fecha una vez y solo en la inscripción propia", () => {
    const sql = read("supabase/migrations/20261124000000_primera_clase_abierta.sql");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("user_id = (select auth.uid())");
    expect(sql).toContain("first_lesson_opened_at is null");
    expect(sql).toMatch(/revoke execute on function public\.mark_course_opened\(uuid\) from public, anon/);
  });
});
