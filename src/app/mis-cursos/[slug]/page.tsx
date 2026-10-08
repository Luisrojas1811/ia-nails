import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { bunnyEmbedFor } from "@/lib/bunny";
import { courseProgress, formatDuration, isEnrollmentActive, pickLesson, type Lesson } from "@/lib/learning";
import { LessonPlayer } from "@/components/LessonPlayer";
import { ProgressBar } from "@/components/ProgressBar";
import { toggleComplete } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi curso", robots: { index: false } };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ leccion?: string }> };

export default async function LearnPage({ params, searchParams }: Props) {
  const [{ slug }, { leccion }] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) notFound();
  const user = await getUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(`/mis-cursos/${slug}`)}`);
  const db = await createClient();
  if (!db) redirect("/ingresar");

  const { data: course } = await db.from("courses").select("id, name").eq("slug", slug).maybeSingle();
  if (!course) notFound();
  const { data: enrollment } = await db.from("enrollments").select("status, expires_at").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
  if (!enrollment || !isEnrollmentActive(enrollment)) redirect(`/cursos/${slug}`); // todavía no lo compró

  const { data: lessonRows } = await db.from("lessons").select("id, position, title, duration_seconds, is_preview").eq("course_id", course.id).order("position");
  const lessons = (lessonRows ?? []) as Lesson[];
  const { data: progressRows } = lessons.length
    ? await db.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessons.map((l) => l.id))
    : { data: [] };
  const completed = new Set(((progressRows ?? []) as { lesson_id: string }[]).map((p) => p.lesson_id));
  const progress = courseProgress(lessons.map((l) => l.id), completed);
  const current = pickLesson(lessons, completed, leccion);

  let embedUrl: string | null = null;
  if (current) {
    const { data: video } = await db.from("lesson_videos").select("bunny_video_id").eq("lesson_id", current.id).maybeSingle();
    embedUrl = bunnyEmbedFor(video?.bunny_video_id);
  }

  return (
    <section className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <Link href="/mis-cursos" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-violet">
          <ArrowLeft size={16} aria-hidden /> Mis cursos
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight lg:text-4xl">{course.name}</h1>
        <div className="mt-4 max-w-md"><ProgressBar {...progress} /></div>

        {!current ? (
          <p className="mt-10 rounded-2xl bg-surface-lowest p-8 text-ink-muted shadow-md">
            Las clases de este curso se están cargando. Te avisamos apenas estén disponibles.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <LessonPlayer embedUrl={embedUrl} title={current.title} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-bold tracking-tight">{current.position}. {current.title}</h2>
                <form action={toggleComplete}>
                  <input type="hidden" name="lessonId" value={current.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
                    {completed.has(current.id) ? "Quitar de vistas" : "Marcar como vista"}
                  </button>
                </form>
              </div>
            </div>
            <nav aria-label="Clases del curso" className="lg:col-span-4">
              <ol className="divide-y divide-surface-high overflow-hidden rounded-2xl bg-surface-lowest shadow-md">
                {lessons.map((l) => {
                  const isCurrent = l.id === current.id;
                  return (
                    <li key={l.id}>
                      <Link href={`/mis-cursos/${slug}?leccion=${l.position}`} aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-start gap-3 px-4 py-3 transition hover:bg-surface-low ${isCurrent ? "bg-violet-soft/50" : ""}`}>
                        {completed.has(l.id)
                          ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-violet" aria-label="Vista" />
                          : <Circle size={20} className="mt-0.5 shrink-0 text-line" aria-label="Sin ver" />}
                        <span className="flex-1 text-sm font-semibold">{l.position}. {l.title}</span>
                        <span className="shrink-0 text-xs text-ink-muted">{formatDuration(l.duration_seconds)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
