import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { courses } from "@/lib/courses";
import { site, whatsappLink } from "@/lib/site";
import { CourseCard } from "@/components/CourseCard";
import { Divider } from "@/components/Divider";
import { Placeholder } from "@/components/Placeholder";
import { Reveal } from "@/components/Reveal";

const pill = "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider transition";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface-lowest px-6 py-16 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-violet-soft/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="flex flex-col items-start gap-8 lg:col-span-7">
            <h1 className="font-serif text-[38px] font-semibold leading-[1.05] tracking-tight lg:text-[56px]">
              TÉCNICA DE AUTOR <br /><span className="font-normal italic text-violet">&amp; ALTA FORMACIÓN</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
              Atelier en Bernal y academia online de técnicas de uñas. Aprendé paso a paso, cuidando siempre la uña natural.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#cursos" className={`${pill} bg-black text-white hover:bg-violet`}>Ver cursos</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={`${pill} bg-surface-high hover:bg-violet-soft`}>
                <MessageCircle size={18} aria-hidden /> Escribime por WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative lg:col-span-5">
            <div className="absolute -right-4 -top-4 h-full w-full rotate-2 rounded-xl bg-violet-soft/50" />
            <Placeholder label="Foto de Iara (pendiente)" className="relative h-[480px] w-full rounded-xl shadow-2xl" />
          </Reveal>
        </div>
      </section>

      <Divider />

      <section id="sobre-mi" className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <Placeholder label="Foto del atelier (pendiente)" className="h-[420px] rounded-xl shadow-xl" />
          </Reveal>
          <Reveal delay={100} className="space-y-5 lg:col-span-7">
            <h2 className="font-serif text-3xl font-medium tracking-tight lg:text-[40px] lg:leading-[1.2]">
              La manicuría tratada como una <span className="italic text-violet">disciplina escultórica</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted">[Bio de Iara — pendiente de confirmar]</p>
          </Reveal>
        </div>
      </section>

      <section id="cursos" className="bg-surface-lowest px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-2xl">
            <h2 className="font-serif text-3xl font-medium tracking-tight lg:text-[40px] lg:leading-[1.2]">
              Cursos online <span className="italic text-violet">paso a paso</span>
            </h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 120}><CourseCard course={c} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="px-6 py-20 lg:px-12 lg:py-28">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-start gap-6">
          <h2 className="font-serif text-3xl font-medium tracking-tight lg:text-[40px]">Atelier <span className="italic text-violet">Bernal</span></h2>
          <p className="flex items-start gap-3 text-lg text-ink-muted">
            <MapPin className="mt-1 shrink-0 text-violet" size={20} aria-hidden />
            <span>{site.address.street}, {site.address.area}</span>
          </p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={`${pill} bg-black text-white hover:bg-violet`}>
            Escribime por WhatsApp <ArrowRight size={18} aria-hidden />
          </a>
        </Reveal>
      </section>
    </>
  );
}
