import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { courses } from "@/lib/courses";
import { site, whatsappLink } from "@/lib/site";
import { works } from "@/lib/works";
import { CourseCard } from "@/components/CourseCard";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Divider } from "@/components/Divider";
import { Reveal } from "@/components/Reveal";

const pill = "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider transition";
const h2 = "font-serif text-3xl font-bold tracking-tight lg:text-[40px] lg:leading-[1.2]";
const featured = works.filter((w) => w.featured);
const slides = works.filter((w) => w.carousel).map(({ src, alt }) => ({ src, alt }));

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface-lowest px-6 py-16 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-violet-soft/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="flex flex-col items-start gap-8 lg:col-span-7">
            <h1 className="font-serif text-[38px] font-bold leading-[1.05] tracking-tight lg:text-[56px]">
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
            <HeroSlideshow slides={slides} />
          </Reveal>
        </div>
      </section>

      <Divider />

      <section id="cursos" className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-2xl">
            <h2 className={h2}>Cursos online <span className="italic text-violet">paso a paso</span></h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 120}><CourseCard course={c} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre-mi" className="bg-surface-lowest px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-xl">
              <Image src="/images/iara-sobre-mi.jpg" alt="Iara, nail artist, sonriendo en su atelier" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[center_30%]" />
            </div>
          </Reveal>
          <Reveal delay={100} className="space-y-5 lg:col-span-7">
            <h2 className={h2}>La manicuría tratada como una <span className="italic text-violet">disciplina escultórica</span></h2>
            <div className="max-w-xl space-y-4 text-lg leading-relaxed text-ink-muted">
              <p>Soy Iara, nail artist y creadora de Ianails. Mi camino empezó en 2022, cuando todavía estaba en el secundario y tenía unas ganas enormes de tener mis propios ingresos.</p>
              <p>El arte siempre fue lo mío, y las uñas fueron ese lugar donde todo encajó.</p>
              <p>Hoy me dedico de lleno a este oficio y a compartir lo que aprendí a través de cursos iniciales para personas que, como yo, quieren construir algo propio. Con más de 4 años de experiencia, no solo te enseño técnica: te acompaño desde donde estás, guiándote paso a paso en todo lo que necesites.</p>
              <p>Así que si estás lista para empezar… bienvenida a Ianails ✨</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="trabajos" className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 max-w-2xl">
            <h2 className={h2}>Trabajos <span className="italic text-violet">de autor</span></h2>
          </Reveal>
          <Reveal>
            <div className="columns-2 gap-4 lg:columns-3 lg:gap-6">
              {featured.map((w) => (
                <div key={w.src} className="mb-4 break-inside-avoid overflow-hidden rounded-xl bg-surface-low lg:mb-6">
                  <Image src={w.src} alt={w.alt} width={w.width} height={w.height} sizes="(min-width:1024px) 33vw, 50vw" className="h-auto w-full" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contacto" className="bg-surface-lowest px-6 py-20 lg:px-12 lg:py-28">
        <Reveal className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <h2 className={h2}>Atelier <span className="italic text-violet">Bernal</span></h2>
            <p className="flex items-start gap-3 text-lg text-ink-muted">
              <MapPin className="mt-1 shrink-0 text-violet" size={20} aria-hidden />
              <span>{site.address.street}, {site.address.area}</span>
            </p>
            <ul className="space-y-1 pl-8 text-ink-muted">{site.hours.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
          <div className="flex flex-col items-start gap-4">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={`${pill} bg-black text-white hover:bg-violet`}>
              Escribime por WhatsApp <ArrowRight size={18} aria-hidden />
            </a>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 break-all text-ink-muted hover:text-violet">
              <Mail size={18} className="shrink-0" aria-hidden /> {site.email}
            </a>
            <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-violet">@{site.instagram}</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
