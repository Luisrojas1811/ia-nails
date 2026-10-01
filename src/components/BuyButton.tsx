"use client";
import { useActionState } from "react";
import { startCheckout } from "@/app/cursos/[slug]/actions";

export function BuyButton({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(startCheckout, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet disabled:opacity-60">
        {pending ? "Redirigiendo a Mercado Pago…" : "Comprar curso"}
      </button>
      {state.error && <p role="alert" className="text-sm font-semibold text-red-700">{state.error}</p>}
    </form>
  );
}
