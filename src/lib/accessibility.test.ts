import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Contraste según WCAG 2.x: texto normal 4.5:1, componentes de interfaz 3:1.
const css = readFileSync("src/app/globals.css", "utf8");
const tokens: Record<string, string> = { white: "#ffffff", black: "#000000" };
for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[m[1]] = m[2];

const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (fg: string, bg: string) => { const [a, b] = [lum(tokens[fg]), lum(tokens[bg])].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };

// [texto, fondo, mínimo, dónde se usa]
const pairs: [string, string, number, string][] = [
  ["ink", "surface", 4.5, "texto principal"], ["ink", "surface-lowest", 4.5, "texto sobre tarjetas"],
  ["ink-muted", "surface", 4.5, "párrafos"], ["ink-muted", "surface-lowest", 4.5, "párrafos sobre blanco"],
  ["ink-muted", "surface-low", 4.5, "pie de página"], ["ink-muted", "surface-high", 4.5, "texto sobre gris"],
  ["ink-muted", "violet-soft", 4.5, "texto sobre bloques lilas"],
  ["violet", "surface", 4.5, "acentos y links"], ["violet", "surface-lowest", 4.5, "links sobre blanco"],
  ["violet", "surface-low", 4.5, "links sobre gris claro"], ["violet", "surface-high", 4.5, "links sobre gris"],
  ["violet", "violet-soft", 4.5, "violeta sobre lila"],
  ["white", "violet", 4.5, "botón en hover"], ["white", "black", 4.5, "botones"],
  ["violet-deep", "violet-soft", 4.5, "etiquetas"],
  ["error", "surface-lowest", 4.5, "mensajes de error"], ["error", "surface", 4.5, "mensajes de error"],
  ["violet", "surface", 3, "anillo de foco"], ["outline", "surface-lowest", 3, "borde de campos sobre tarjeta blanca"],
  ["outline", "surface", 3, "borde de campos sobre el fondo"], ["ink-muted", "surface-low", 3, "íconos de estado"],
];

describe("contraste de colores (WCAG AA)", () => {
  it.each(pairs)("%s sobre %s ≥ %s (%s)", (fg, bg, min) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p.replace(/\\/g, "/")]; }); // en Windows las rutas traen "\", se unifican con "/"
const tsx = walk("src").filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"));
const source = Object.fromEntries(tsx.map((f) => [f, readFileSync(f, "utf8")]));

describe("reglas de accesibilidad en el código", () => {
  it("todo color de texto usado está en la lista medida (si agregás uno nuevo, sumalo arriba)", () => {
    const measured = new Set(pairs.map(([fg]) => fg));
    const used = new Set(Object.values(source).flatMap((s) => [...s.matchAll(/\btext-(ink-muted|ink|violet-deep|violet|error|white|line|plum|outline)\b/g)].map((m) => m[1])));
    expect([...used].filter((u) => !measured.has(u))).toEqual([]);
  });

  it("no hay texto de menos de 10px", () => {
    const small = Object.entries(source).filter(([, s]) => /text-\[(\d|9)px\]/.test(s)).map(([f]) => f);
    expect(small).toEqual([]);
  });

  it("los campos de formulario tienen borde visible", () => {
    expect(source["src/components/AuthForm.tsx"]).toContain("border-outline");
    expect(source["src/components/WithdrawalForm.tsx"]).toContain("border-outline");
  });

  it("el sitio tiene link para saltar al contenido y un destino para él", () => {
    const layout = source["src/app/layout.tsx"];
    expect(layout).toContain('href="#contenido"');
    expect(layout).toContain('id="contenido"');
  });

  it("el menú del celular avisa su estado a los lectores de pantalla", () => {
    const menu = source["src/components/MobileMenu.tsx"];
    expect(menu).toContain("aria-expanded");
    expect(menu).toContain("aria-controls");
  });
});
