// Bloque provisorio hasta tener las fotos reales de Iara.
export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label}
      className={`flex items-center justify-center bg-gradient-to-br from-violet-soft to-surface-low text-xs font-semibold uppercase tracking-widest text-ink-muted ${className}`}>
      {label}
    </div>
  );
}
