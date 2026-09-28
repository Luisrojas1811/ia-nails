import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-surface-low text-ink-muted">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 lg:px-12">
        <div className="md:col-span-5">
          <p className="font-serif text-xl font-semibold text-ink">{site.name}</p>
          <p className="mt-3 max-w-sm leading-relaxed">Atelier en Bernal y academia online de técnicas de uñas.</p>
        </div>
        <div className="md:col-span-4">
          <h2 className="text-sm font-bold text-ink">Atelier Bernal</h2>
          <p className="mt-3 leading-relaxed">{site.address.street}<br />{site.address.area}</p>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-bold text-ink">Contacto</h2>
          <ul className="mt-3 space-y-2">
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-violet">WhatsApp</a></li>
            <li><a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-violet">@{site.instagram}</a></li>
            <li><Link href="/#cursos" className="hover:text-violet">Cursos</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line/40 py-6 text-center text-sm">© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
    </footer>
  );
}
