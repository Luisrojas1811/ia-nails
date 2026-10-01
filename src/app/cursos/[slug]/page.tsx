import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { courses, formatPrice, getCourse } from "@/lib/courses";
import { whatsappLink } from "@/lib/site";
import { Placeholder } from "@/components/Placeholder";
import { BuyButton } from "@/components/BuyButton";

const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => courses.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return course ? { title: course.name, description: course.summary } : {};
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
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">{course.name}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{course.summary}</p>
            <div className="space-y-3 border-t border-surface-high pt-8">
              <h2 className="font-serif text-2xl font-medium">Contenido del curso</h2>
              <p className="text-ink-muted">[Temario, duración y nivel — pendientes de confirmar]</p>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl bg-surface-lowest shadow-xl lg:sticky lg:top-28">
              <Placeholder label="Portada del curso" className="h-56" />
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
