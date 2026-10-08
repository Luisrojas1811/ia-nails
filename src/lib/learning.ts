export type Lesson = { id: string; position: number; title: string; duration_seconds: number | null; is_preview: boolean };

export const isEnrollmentActive = (e: { status: string; expires_at: string | null }, now = new Date()) =>
  e.status === "active" && (!e.expires_at || new Date(e.expires_at) > now);

export function courseProgress(lessonIds: string[], completed: Set<string>) {
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => completed.has(id)).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

// Clase pedida por la URL (?leccion=3, por posición); si no hay o no existe, la primera sin ver; si todas están vistas, la primera.
export function pickLesson(lessons: Lesson[], completed: Set<string>, requested?: string | number | null): Lesson | null {
  if (lessons.length === 0) return null;
  const sorted = [...lessons].sort((a, b) => a.position - b.position);
  const wanted = Number(requested);
  const byPosition = Number.isInteger(wanted) ? sorted.find((l) => l.position === wanted) : undefined;
  return byPosition ?? sorted.find((l) => !completed.has(l.id)) ?? sorted[0];
}

export function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return "";
  const m = Math.max(1, Math.round(seconds / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}
