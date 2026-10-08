import type { Metadata } from "next";
import Link from "next/link";
import { WithdrawalForm } from "@/components/WithdrawalForm";

export const metadata: Metadata = { title: "Solicitud de arrepentimiento" };

export default function ArrepentimientoPage() {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl rounded-2xl bg-surface-lowest p-8 shadow-xl lg:p-12">
        <h1 className="font-serif text-3xl font-bold tracking-tight lg:text-4xl">Solicitud de arrepentimiento</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
          Tenés 10 días corridos desde la compra para arrepentirte. No necesitás tener una cuenta ni explicar el motivo.
          Usamos estos datos solo para gestionar tu solicitud (<Link href="/privacidad" className="font-semibold text-violet">política de privacidad</Link>).
        </p>
        <div className="mt-10"><WithdrawalForm /></div>
        <p className="mt-10 text-sm text-ink-muted">
          Más información en la <Link href="/devoluciones" className="font-semibold text-violet">política de devoluciones</Link>.
        </p>
      </div>
    </section>
  );
}
