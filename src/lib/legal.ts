export type LegalDoc = { title: string; updated: string; sections: { heading: string; body: string[] }[] };
export type Token =
  | { type: "text"; value: string }
  | { type: "pending"; value: string }
  | { type: "link"; value: string; href: string };

// [[PENDIENTE: ...]] marca un dato que falta confirmar. [texto](/ruta) es un link interno.
const TOKENS = /(\[\[PENDIENTE[^\]]*\]\]|\[[^\]]+\]\(\/[^)]*\))/;
const PENDING = /^\[\[(PENDIENTE[^\]]*)\]\]$/;
const LINK = /^\[([^\]]+)\]\((\/[^)]*)\)$/;

export function tokenize(text: string): Token[] {
  return text.split(TOKENS).filter(Boolean).map((part): Token => {
    const p = part.match(PENDING);
    if (p) return { type: "pending", value: p[1] };
    const l = part.match(LINK);
    if (l) return { type: "link", value: l[1], href: l[2] };
    return { type: "text", value: part };
  });
}

export const countPending = (doc: LegalDoc) =>
  [doc.updated, ...doc.sections.flatMap((s) => [s.heading, ...s.body])]
    .flatMap(tokenize).filter((t) => t.type === "pending").length;

export const internalLinks = (doc: LegalDoc) =>
  doc.sections.flatMap((s) => s.body).flatMap(tokenize).flatMap((t) => (t.type === "link" ? [t.href] : []));
