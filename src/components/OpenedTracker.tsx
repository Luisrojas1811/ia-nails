"use client";
import { useEffect } from "react";
import { markCourseOpened } from "@/app/mis-cursos/[slug]/actions";

// Se monta solo cuando la clase muestra su video. Corre en el navegador (no en una precarga de la página),
// así se registra únicamente una apertura real.
export function OpenedTracker({ courseId }: { courseId: string }) {
  useEffect(() => { void markCourseOpened(courseId); }, [courseId]);
  return null;
}
