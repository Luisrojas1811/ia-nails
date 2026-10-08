import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export const dynamic = "force-dynamic"; // depende de la sesión de cada persona
export const metadata: Metadata = { title: "Mis cursos", robots: { index: false } };

export default async function MisCursosPage() {
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/mis-cursos");
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Hola{name ? `, ${name.split(" ")[0]}` : ""} <span className="font-normal italic text-violet">👋</span>
          </h1>
          <form action={signOut}>
            <button className="text-sm font-semibold text-ink-muted hover:text-violet">Cerrar sesión</button>
          </form>
        </div>
        <div className="rounded-2xl bg-surface-lowest p-8 shadow-md">
          <h2 className="font-serif text-2xl font-bold">Todavía no tenés cursos</h2>
          <p className="mt-2 text-ink-muted">Cuando compres un curso, va a aparecer acá.</p>
          <Link href="/#cursos" className="mt-6 inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
            Ver cursos
          </Link>
        </div>
      </div>
    </section>
  );
}
