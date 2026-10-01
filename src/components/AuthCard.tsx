import type { ReactNode } from "react";

export function AuthCard({ title, intro, notice, footer, children }: {
  title: string; intro?: string; notice?: string; footer?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-md rounded-2xl bg-surface-lowest p-8 shadow-xl lg:p-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
        {intro && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{intro}</p>}
        {notice && <p role="alert" className="mt-5 rounded-lg bg-violet-soft px-4 py-3 text-sm text-violet-deep">{notice}</p>}
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-7 space-y-2 text-sm text-ink-muted">{footer}</div>}
      </div>
    </section>
  );
}
