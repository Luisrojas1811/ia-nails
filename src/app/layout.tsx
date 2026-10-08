import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, UnifrakturCook } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces" });
const unifraktur = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--font-unifraktur" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ia-nails-lpwe.vercel.app"), // TODO: dominio real
  openGraph: { siteName: "IA NAILS", locale: "es_AR", type: "website" },
  robots: { index: false, follow: false }, // TODO: quitar al lanzar
  title: { default: "IA NAILS — Atelier & Academia", template: "%s | IA NAILS" },
  description: "Cursos online de técnicas de uñas: Soft Gel, Semipermanente, Polygel y Nail Art. Atelier en Bernal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fraunces.variable} ${jakarta.variable} ${unifraktur.variable}`}>
      <body>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
