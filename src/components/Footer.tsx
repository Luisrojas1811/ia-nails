import Image from "next/image";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

const legal = [
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Devoluciones", href: "/devoluciones" },
];

export function Footer() {
  return (
    <footer className="bg-surface-low text-ink-muted">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 lg:px-12">
        <div className="md:col-span-3">
          <Image src="/images/logo.png" alt={site.name} width={713} height={702} className="h-24 w-auto" />
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-bold text-ink">Atelier Bernal</h2>
          <p className="mt-3 leading-relaxed">{site.address.street}<br />{site.address.area}</p>
          <ul className="mt-3 space-y-1 text-sm">{site.hours.map((h) => <li key={h}>{h}</li>)}</ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-bold text-ink">Contacto</h2>
          <ul className="mt-3 space-y-2">
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-violet">WhatsApp {site.whatsappDisplay}</a></li>
            <li><a href={`mailto:${site.email}`} className="break-all hover:text-violet">{site.email}</a></li>
            <li><a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-violet">@{site.instagram}</a></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-bold text-ink">Legales</h2>
          <ul className="mt-3 space-y-2">
            {legal.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-violet">{l.label}</Link></li>)}
          </ul>
          <Link href="/arrepentimiento" className="mt-5 inline-block rounded-full border border-ink px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:bg-black hover:text-white">
            Botón de arrepentimiento
          </Link>
        </div>
      </div>
      <p className="border-t border-line/40 py-6 text-center text-sm">© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
    </footer>
  );
}
