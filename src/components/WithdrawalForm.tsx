"use client";
import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";
import { courses } from "@/lib/courses";
import type { WithdrawalState } from "@/lib/withdrawal";
import { requestWithdrawal } from "@/app/arrepentimiento/actions";

const MAX = 1000;
const label = "block text-xs font-bold uppercase tracking-wider";
const input = "mt-2 w-full rounded-lg bg-surface-low px-4 py-3 outline-none transition focus:bg-surface-lowest focus:ring-2 focus:ring-violet";

export function WithdrawalForm() {
  const [state, action, pending] = useActionState<WithdrawalState, FormData>(requestWithdrawal, {});
  const v = state.values;
  const [reason, setReason] = useState("");

  if (state.code) {
    return (
      <div role="status" className="space-y-5">
        <h2 className="font-serif text-2xl font-bold">Recibimos tu solicitud</h2>
        <p className="rounded-xl bg-violet-soft px-5 py-4 text-center font-mono text-2xl font-bold tracking-widest text-violet-deep">{state.code}</p>
        <p className="leading-relaxed text-ink-muted">
          Guardá este código: identifica tu trámite. {state.emailed && "También te lo enviamos por mail. "}Te reintegramos el importe por el mismo medio de pago que usaste y se desactiva el acceso al curso.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className={label}>Nombre *</label>
          <input id="first_name" name="first_name" required maxLength={80} autoComplete="given-name" defaultValue={v?.first_name} className={input} />
        </div>
        <div>
          <label htmlFor="last_name" className={label}>Apellido *</label>
          <input id="last_name" name="last_name" required maxLength={80} autoComplete="family-name" defaultValue={v?.last_name} className={input} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email de tu compra *</label>
          <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={v?.email} className={input} />
        </div>
        <div>
          <label htmlFor="order_ref" className={label}>Número de compra (opcional)</label>
          <input id="order_ref" name="order_ref" maxLength={100} autoComplete="off" defaultValue={v?.order_ref} className={input} />
        </div>
      </div>

      <fieldset>
        <legend className={label}>Curso que querés devolver *</legend>
        <div className="mt-3 space-y-2">
          {courses.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface-low px-4 py-3">
              <input type="checkbox" name="courses" value={c.slug} defaultChecked={v?.courses.includes(c.slug)} className="h-4 w-4 accent-violet" />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="reason" className={label}>Comentarios (opcional)</label>
        <textarea id="reason" name="reason" rows={5} maxLength={MAX} defaultValue={v?.reason}
          onChange={(e) => setReason(e.target.value)} aria-describedby="reason-count" className={input} />
        <p id="reason-count" className="mt-2 text-xs text-ink-muted">
          No hace falta que expliques el motivo. Máximo {MAX.toLocaleString("es-AR")} caracteres ({MAX - (reason.length || v?.reason.length || 0)} restantes).
        </p>
      </div>

      {/* Trampa para bots: las personas no lo ven ni lo completan. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Sitio web <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {state.error && <p role="alert" className="text-sm font-semibold text-red-700">{state.error}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet disabled:opacity-60">
        {pending ? "Enviando…" : "Enviar solicitud"} <ArrowRight size={18} aria-hidden />
      </button>
    </form>
  );
}
