"use server";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Marca o desmarca una clase como vista. La base solo deja registrar progreso si la persona tiene el curso (RLS).
export async function toggleComplete(fd: FormData): Promise<void> {
  const lessonId = String(fd.get("lessonId") ?? "");
  const slug = String(fd.get("slug") ?? "");
  if (!UUID.test(lessonId) || !SLUG.test(slug)) return;
  const [user, db] = await Promise.all([getUser(), createClient()]);
  if (!user || !db) return;

  const { data: existing } = await db.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("lesson_id", lessonId).maybeSingle();
  if (existing) await db.from("lesson_progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
  else await db.from("lesson_progress").insert({ user_id: user.id, lesson_id: lessonId });

  revalidatePath(`/mis-cursos/${slug}`);
  revalidatePath("/mis-cursos");
}

// Registra la primera vez que la alumna abre una clase con video (define si el curso ya fue "usado"
// para el arrepentimiento). La función de la base solo escribe la fecha una vez y solo en la inscripción propia.
export async function markCourseOpened(courseId: string): Promise<void> {
  if (!UUID.test(courseId)) return;
  const [user, db] = await Promise.all([getUser(), createClient()]);
  if (!user || !db) return;
  const { error } = await db.rpc("mark_course_opened", { p_course_id: courseId });
  if (error) console.warn("[cursos] no se pudo registrar la primera clase abierta:", error.message);
}
