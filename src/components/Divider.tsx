export function Divider() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-3 py-8">
      <span className="h-px w-24 bg-line/40" />
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-violet">
        <path d="M4 10C10 2 15 2 20 10C25 18 30 18 36 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 10C10 18 15 18 20 10C25 2 30 2 36 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
        <circle cx="20" cy="10" r="2.5" fill="currentColor" />
      </svg>
      <span className="h-px w-24 bg-line/40" />
    </div>
  );
}
