import type { Metadata } from "next";
import Image from "next/image";
import { Grenze_Gotisch, Jacquard_24, New_Rocker, Pirata_One, Playfair_Display, UnifrakturCook, UnifrakturMaguntia } from "next/font/google";

// PÁGINA TEMPORAL para elegir tipografía con Iara. Borrar /tipografias cuando se decida.
export const metadata: Metadata = { title: "Tipografías (prueba)", robots: { index: false, follow: false } };

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"] });
const grenze = Grenze_Gotisch({ subsets: ["latin"], weight: ["600"] });
const pirata = Pirata_One({ subsets: ["latin"], weight: "400" });
const cook = UnifrakturCook({ subsets: ["latin"], weight: "700" });
const maguntia = UnifrakturMaguntia({ subsets: ["latin"], weight: "400" });
const rocker = New_Rocker({ subsets: ["latin"], weight: "400" });
const jacquard = Jacquard_24({ subsets: ["latin"], weight: "400" });

const options = [
  { id: "Actual", name: "Playfair Display (la del diseño aprobado)", note: "Serif elegante, no gótica", font: playfair },
  { id: "A", name: "Grenze Gotisch", note: "Gótica moderna. Ojo: la \"I\" se confunde con una \"l\"", font: grenze },
  { id: "B", name: "Pirata One", note: "Gótica marcada y compacta", font: pirata },
  { id: "C", name: "UnifrakturCook", note: "Gótica clásica y gruesa. De las más parecidas a tu logo", font: cook },
  { id: "D", name: "UnifrakturMaguntia", note: "Gótica clásica con más adornos. También parecida a tu logo", font: maguntia },
  { id: "E", name: "New Rocker", note: "Gótica estilo rock, muy llamativa", font: rocker },
  { id: "F", name: "Jacquard 24", note: "Gótica en estilo pixelado", font: jacquard },
];

export default function TipografiasPage() {
  return (
    <section className="px-6 py-14 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold">Elegí la tipografía</h1>
          <p className="max-w-2xl text-ink-muted">
            Se usaría en los títulos y en el nombre. El texto corrido sigue en la letra actual, para que se lea bien en el celular.
            Las góticas se leen mejor en mayúscula y minúscula que todo en mayúsculas, por eso los ejemplos están así.
          </p>
          <div className="flex items-center gap-4 rounded-xl bg-surface-lowest p-4 shadow-sm">
            <Image src="/images/logo.png" alt="Tu logo" width={713} height={702} className="h-24 w-auto" />
            <p className="text-sm text-ink-muted">Tu logo, como referencia para comparar.</p>
          </div>
        </header>
        {options.map(({ id, name, note, font }) => (
          <div key={id} className="space-y-6 rounded-2xl bg-surface-lowest p-8 shadow-md">
            <div>
              <p className="text-sm font-bold">{id === "Actual" ? name : `Opción ${id} — ${name}`}</p>
              <p className="text-sm text-ink-muted">{note}</p>
            </div>
            <div style={{ fontFamily: font.style.fontFamily }} className="space-y-4">
              <p className="text-5xl">IaNails</p>
              <h2 className="text-4xl leading-tight lg:text-6xl">
                Técnica de autor <br /><span className="text-violet">&amp; alta formación</span>
              </h2>
              <p className="text-2xl">Soft Gel inicial · Capping Polygel · Nail Art nivel 2</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
