import type { SupabaseClient } from "@supabase/supabase-js";
import { courseProgress, isEnrollmentActive } from "./learning";

export type MyCourse = { slug: string; name: string; total: number; done: number; percent: number };

// Cursos que la persona tiene habilitados, con su avance. Las reglas de seguridad (RLS) de la base
// ya limitan todo a sus propias filas; el filtro por user_id es una segunda barrera.
export async function getMyCourses(db: SupabaseClient, userId: string): Promise<MyCourse[]> {
  const { data: enrollments } = await db.from("enrollments").select("course_id, status, expires_at").eq("user_id", userId);
  const active = ((enrollments ?? []) as { course_id: string; status: string; expires_at: string | null }[]).filter((e) => isEnrollmentActive(e));
  if (active.length === 0) return [];
  const ids = active.map((e) => e.course_id);
  const [courses, lessons, progress] = await Promise.all([
    db.from("courses").select("id, slug, name").in("id", ids),
    db.from("lessons").select("id, course_id").in("course_id", ids),
    db.from("lesson_progress").select("lesson_id").eq("user_id", userId),
  ]);
  const done = new Set(((progress.data ?? []) as { lesson_id: string }[]).map((p) => p.lesson_id));
  const lessonRows = (lessons.data ?? []) as { id: string; course_id: string }[];
  return ((courses.data ?? []) as { id: string; slug: string; name: string }[]).map((c) => ({
    slug: c.slug, name: c.name,
    ...courseProgress(lessonRows.filter((l) => l.course_id === c.id).map((l) => l.id), done),
  }));
}
