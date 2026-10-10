import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { benefits, courses, formatPrice, getCourse } from "@/lib/courses";
import { whatsappLink } from "@/lib/site";
import { Placeholder } from "@/components/Placeholder";
import { BuyButton } from "@/components/BuyButton";

const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => courses.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  if (!course) return {};
  return {
    title: course.name,
    description: course.summary,
    alternates: { canonical: `/cursos/${course.slug}` },
    openGraph: { title: course.name, description: course.summary, siteName: "IA NAILS", locale: "es_AR", type: "website", images: course.cover ? [{ url: course.cover }] : undefined },
  };
}

export default async function CoursePage({ params }: Props) {
  const course = getCourse((await params).slug);
  if (!course) notFound();

  return (
    <section className="px-6 py-12 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Link href="/#cursos" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-violet">
          <ArrowLeft size={16} aria-hidden /> Todos los cursos
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-7">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-violet-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-deep">{course.level}</span>
              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight lg:text-5xl">{course.name}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{course.summary}</p>
            </div>
            <div className="space-y-3 border-t border-surface-high pt-8">
              <h2 className="font-serif text-2xl font-bold">Qué vas a aprender</h2>
              <p className="max-w-2xl leading-relaxed text-ink-muted">{course.learn}</p>
              {course.requirement && <p className="text-sm font-semibold text-violet-deep">{course.requirement}</p>}
            </div>
            <div className="space-y-3 border-t border-surface-high pt-8">
              <h2 className="font-serif text-2xl font-bold">Incluye</h2>
              <ul className="space-y-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-ink-muted">
                    <Check size={18} className="mt-1 shrink-0 text-violet" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl bg-surface-lowest shadow-xl">
              {course.cover ? (
                <div className="relative aspect-[4/5]">
                  <Image src={course.cover} alt={`Portada del curso ${course.name}`} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-center" />
                </div>
              ) : (
                <Placeholder label="Portada pendiente" className="aspect-[4/5]" />
              )}
              <div className="space-y-5 p-7">
                <p className="font-serif text-3xl font-bold">{formatPrice(course.price)}</p>
                {checkoutEnabled ? (
                  <BuyButton slug={course.slug} />
                ) : (
                  <>
                    <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white opacity-50">
                      Comprar curso
                    </button>
                    <p className="text-sm text-ink-muted">El pago online con Mercado Pago estará disponible pronto.</p>
                  </>
                )}
                <a href={whatsappLink(`Hola! Quiero consultar por el curso "${course.name}".`)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:text-violet">
                  <MessageCircle size={18} aria-hidden /> Consultar por este curso
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
