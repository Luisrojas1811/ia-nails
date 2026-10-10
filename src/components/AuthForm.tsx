"use client";
import { useActionState } from "react";
import type { AuthState } from "@/lib/auth";

type Field = { name: string; label: string; type: string; autoComplete: string; minLength?: number; maxLength?: number };

export function AuthForm({ action, fields, submit, hidden = {} }: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[]; submit: string; hidden?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => (
        <div key={f.name} className="space-y-2">
          <label htmlFor={f.name} className="block text-xs font-semibold uppercase tracking-wider">{f.label}</label>
          <input id={f.name} name={f.name} type={f.type} autoComplete={f.autoComplete} required
            minLength={f.minLength} maxLength={f.maxLength}
            defaultValue={f.type === "password" ? undefined : state.values?.[f.name]}
            className="w-full rounded-lg border border-outline bg-surface-low px-4 py-3 outline-none transition focus:bg-surface-lowest focus:ring-2 focus:ring-violet" />
        </div>
      ))}
      {state.error && <p role="alert" className="text-sm font-semibold text-error">{state.error}</p>}
      {state.message && <p role="status" className="text-sm font-semibold text-violet-deep">{state.message}</p>}
      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet disabled:opacity-60">
        {pending ? "Enviando…" : submit}
      </button>
    </form>
  );
}
