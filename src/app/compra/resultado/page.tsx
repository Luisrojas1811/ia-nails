import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resultado de tu compra", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;
const COPY: Record<string, { title: string; text: string }> = {
  paid: { title: "¡Pago aprobado!", text: "Ya podés ver tu curso en Mis cursos." },
  pending: { title: "Estamos confirmando tu pago", text: "Puede tardar unos minutos. Cuando se acredite, el curso aparece en Mis cursos. Actualizá esta página para ver el estado." },
  failed: { title: "El pago no se completó", text: "No se realizó ningún cobro. Podés intentarlo de nuevo cuando quieras." },
  cancelled: { title: "El pago fue cancelado", text: "No se realizó ningún cobro. Podés intentarlo de nuevo cuando quieras." },
  refunded: { title: "Este pago fue reembolsado", text: "Si tenés dudas, escribinos por WhatsApp." },
};

export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  if (!(await getUser())) redirect("/ingresar");

  let status: string | undefined;
  if (order && UUID.test(order)) {
    const supabase = await createClient();
    const { data } = await supabase?.from("orders").select("status").eq("id", order).maybeSingle() ?? {};
    status = data?.status;
  }
  const copy = (status && COPY[status]) || { title: "No encontramos esta compra", text: "Revisá la sección Mis cursos o escribinos por WhatsApp." };

  return (
    <section className="px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-xl space-y-5">
        <h1 role="status" className="font-serif text-4xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-lg leading-relaxed text-ink-muted">{copy.text}</p>
        <Link href={status === "paid" || status === "pending" ? "/mis-cursos" : "/#cursos"}
          className="inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
          {status === "paid" || status === "pending" ? "Ir a Mis cursos" : "Ver cursos"}
        </Link>
      </div>
    </section>
  );
}
