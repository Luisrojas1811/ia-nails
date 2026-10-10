import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { robotsMeta, siteUrl } from "@/lib/seo";
import "./globals.css";

const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-newsreader" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { siteName: "IA NAILS", locale: "es_AR", type: "website" },
  robots: robotsMeta(), // bloqueado hasta que se cargue ALLOW_INDEXING=true (ver docs/LANZAMIENTO.md)
  title: { default: "IA NAILS — Atelier & Academia", template: "%s | IA NAILS" },
  description: "Cursos online de técnicas de uñas: Soft Gel, Semipermanente, Polygel y Nail Art. Atelier en Bernal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${newsreader.variable} ${jakarta.variable}`}>
      <body>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-black focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white">
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="pt-20 focus:outline-none">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
