import Link from "next/link";
import { User } from "lucide-react";
import { site } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface-lowest/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">
        <Link href="/" aria-label={`${site.name}, ir al inicio`} className="flex flex-col leading-none">
          <span className="font-serif text-[26px] font-bold leading-none tracking-tight text-ink">{site.name}</span>
          <span className="mt-1 max-w-[9.5rem] text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-ink-muted sm:max-w-none sm:tracking-[0.18em]">{site.tagline}</span>
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-10 md:flex">
          {site.nav.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold tracking-wider text-ink-muted transition hover:text-violet">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/#cursos" className="hidden rounded-full bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-violet sm:inline-flex">
            Ver cursos
          </Link>
          <Link href="/ingresar" aria-label="Mi cuenta" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-violet">
            <User size={18} aria-hidden />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
