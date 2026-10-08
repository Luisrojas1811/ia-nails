import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { getMyCourses } from "@/lib/learning-data";
import { getCourse } from "@/lib/courses";
import { Placeholder } from "@/components/Placeholder";
import { ProgressBar } from "@/components/ProgressBar";
import { signOut } from "../(auth)/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis cursos", robots: { index: false } };

export default async function MisCursosPage() {
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/mis-cursos");
  const db = await createClient();
  const myCourses = db ? await getMyCourses(db, user.id) : [];
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Hola{name ? `, ${name.split(" ")[0]}` : ""} <span className="italic text-violet">👋</span>
          </h1>
          <form action={signOut}>
            <button className="text-sm font-semibold text-ink-muted hover:text-violet">Cerrar sesión</button>
          </form>
        </div>

        {myCourses.length === 0 ? (
          <div className="rounded-2xl bg-surface-lowest p-8 shadow-md">
            <h2 className="font-serif text-2xl font-bold">Todavía no tenés cursos</h2>
            <p className="mt-2 text-ink-muted">Cuando compres un curso, va a aparecer acá.</p>
            <Link href="/#cursos" className="mt-6 inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
              Ver cursos
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => {
              const cover = getCourse(c.slug)?.cover;
              return (
                <article key={c.slug} className="flex flex-col overflow-hidden rounded-xl bg-surface-lowest shadow-md">
                  {cover ? (
                    <div className="relative aspect-[4/5]">
                      <Image src={cover} alt={`Portada del curso ${c.name}`} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover object-center" />
                    </div>
                  ) : (
                    <Placeholder label="Portada pendiente" className="aspect-[4/5]" />
                  )}
                  <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                    <h2 className="font-serif text-[22px] font-bold leading-snug">{c.name}</h2>
                    <ProgressBar done={c.done} total={c.total} percent={c.percent} />
                    <Link href={`/mis-cursos/${c.slug}`} className="rounded-full bg-black px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
                      {c.done > 0 && c.done < c.total ? "Continuar" : "Ver curso"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
