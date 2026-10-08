// Reproductor: muestra el video firmado de Bunny, o un aviso si todavía no está cargado.
export function LessonPlayer({ embedUrl, title }: { embedUrl: string | null; title: string }) {
  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-surface-low p-6 text-center text-ink-muted">
        El video de esta clase estará disponible muy pronto.
      </div>
    );
  }
  return (
    <iframe src={embedUrl} title={title} loading="lazy" allowFullScreen
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      className="aspect-video w-full rounded-xl border-0 bg-black" />
  );
}
