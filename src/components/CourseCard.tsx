import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Course } from "@/lib/courses";
import { Placeholder } from "./Placeholder";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-md transition-shadow hover:shadow-xl">
      {course.cover ? (
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image src={course.cover} alt={`Portada del curso ${course.name}`} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover object-center" />
        </div>
      ) : (
        <Placeholder label="Portada pendiente" className="aspect-[4/5]" />
      )}
      <div className="flex flex-1 flex-col justify-between gap-6 p-7">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-violet">{course.level}</p>
          <h3 className="font-serif text-[22px] font-bold leading-snug">{course.name}</h3>
          <p className="leading-relaxed text-ink-muted">{course.summary}</p>
        </div>
        <div className="flex items-center justify-between border-t border-surface-high pt-5">
          <p className="font-serif text-2xl font-bold">{formatPrice(course.price)}</p>
          <Link href={`/cursos/${course.slug}`} className="rounded-full bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
            Ver curso
          </Link>
        </div>
      </div>
    </article>
  );
}
