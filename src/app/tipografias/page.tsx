import type { Metadata } from "next";
import { Grenze_Gotisch, Pirata_One, UnifrakturCook, Playfair_Display } from "next/font/google";

// PÁGINA TEMPORAL para elegir tipografía con Iara. Borrar /tipografias cuando se decida.
export const metadata: Metadata = { title: "Tipografías (prueba)", robots: { index: false, follow: false } };

const grenze = Grenze_Gotisch({ subsets: ["latin"], weight: ["600"] });
const pirata = Pirata_One({ subsets: ["latin"], weight: "400" });
const unifraktur = UnifrakturCook({ subsets: ["latin"], weight: "700" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"] });

const options = [
  { name: "Actual — Playfair Display", note: "Serif editorial (la del diseño aprobado)", font: playfair, italic: true },
  { name: "A — Grenze Gotisch", note: "Gótica moderna y elegante: la más legible", font: grenze, italic: false },
  { name: "B — Pirata One", note: "Gótica marcada, más compacta", font: pirata, italic: false },
  { name: "C — UnifrakturCook", note: "Gótica clásica (estilo Old English): la más dramática", font: unifraktur, italic: false },
];

export default function TipografiasPage() {
  return (
    <section className="px-6 py-14 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Elegí la tipografía</h1>
          <p className="max-w-2xl text-ink-muted">
            Se usaría en el logo y los títulos. El texto corrido sigue en la letra actual, para que se lea bien en el celular.
          </p>
        </header>
        {options.map(({ name, note, font, italic }) => (
          <div key={name} className="space-y-6 rounded-2xl bg-surface-lowest p-8 shadow-md">
            <div>
              <p className="text-sm font-bold">{name}</p>
              <p className="text-sm text-ink-muted">{note}</p>
            </div>
            <div style={{ fontFamily: font.style.fontFamily }} className="space-y-5">
              <p className="text-4xl">IA NAILS</p>
              <h2 className="text-4xl leading-tight lg:text-6xl">
                TÉCNICA DE AUTOR <br />
                <span className={`text-violet ${italic ? "italic font-normal" : ""}`}>&amp; ALTA FORMACIÓN</span>
              </h2>
              <p className="text-2xl">Soft Gel inicial · Capping Polygel · Nail Art nivel 2</p>
            </div>
            <p className="text-sm text-ink-muted">Así se ve el texto corrido: Aprendé todo lo que necesitás saber desde cero.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
