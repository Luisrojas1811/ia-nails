export function ProgressBar({ done, total, percent }: { done: number; total: number; percent: number }) {
  return (
    <div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Avance del curso" className="h-2 overflow-hidden rounded-full bg-surface-high">
        <div className="h-full rounded-full bg-violet transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-ink-muted">{total === 0 ? "Clases próximamente" : `${done} de ${total} clases vistas`}</p>
    </div>
  );
}
