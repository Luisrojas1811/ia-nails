import Link from "next/link";
import { countPending, tokenize, type LegalDoc } from "@/lib/legal";

function Rich({ text }: { text: string }) {
  return tokenize(text).map((t, i) =>
    t.type === "pending" ? <mark key={i} className="rounded bg-yellow-200 px-1 text-yellow-950">{t.value}</mark>
    : t.type === "link" ? <Link key={i} href={t.href} className="font-semibold text-violet underline underline-offset-4">{t.value}</Link>
    : <span key={i}>{t.value}</span>,
  );
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const pending = countPending(doc);
  return (
    <article className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-3xl">
        {pending > 0 && (
          <p role="note" className="mb-8 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-950">
            Borrador sujeto a revisión: hay {pending} datos pendientes de confirmar (resaltados).
          </p>
        )}
        <h1 className="font-serif text-4xl font-semibold tracking-tight lg:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">Última actualización: <Rich text={doc.updated} /></p>
        <div className="mt-10 space-y-9">
          {doc.sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="font-serif text-2xl font-medium">{i + 1}. {s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink-muted">
                {s.body.map((p, j) => <p key={j}><Rich text={p} /></p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
