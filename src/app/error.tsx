"use client";

// Pantalla amable para cualquier error inesperado (por ejemplo, si la base de datos no responde).
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[60vh] items-center px-6 py-24 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-5xl">Algo salió <span className="italic text-violet">mal</span></h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
          No pudimos cargar esta página. Probá de nuevo en unos minutos. Si sigue pasando, escribinos por WhatsApp.
        </p>
        <button onClick={reset} className="rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet">
          Reintentar
        </button>
      </div>
    </section>
  );
}
