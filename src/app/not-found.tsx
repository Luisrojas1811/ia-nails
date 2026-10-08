import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center px-6 py-24 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
        <p className="text-sm font-bold text-violet">Error 404</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-5xl">
          Esta página <span className="font-normal italic text-violet">no existe</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
          Puede que el link esté mal escrito o que el curso ya no esté disponible.
        </p>
        <Link href="/" className="rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
