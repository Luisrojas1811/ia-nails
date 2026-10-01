import { describe, expect, it } from "vitest";
import { countPending, internalLinks, tokenize } from "./legal";
import { devoluciones, privacidad, terminos } from "@/content/legal";

const ROUTES = ["/arrepentimiento", "/devoluciones", "/terminos", "/privacidad"];
const docs = { terminos, privacidad, devoluciones };

describe("tokenize", () => {
  it("separa texto, datos pendientes y links internos", () => {
    expect(tokenize("Usá el [botón](/arrepentimiento) y [[PENDIENTE: plazo]] ya.")).toEqual([
      { type: "text", value: "Usá el " },
      { type: "link", value: "botón", href: "/arrepentimiento" },
      { type: "text", value: " y " },
      { type: "pending", value: "PENDIENTE: plazo" },
      { type: "text", value: " ya." },
    ]);
  });
  it("no interpreta links externos como links", () => {
    expect(tokenize("[x](https://evil.com)").every((t) => t.type === "text")).toBe(true);
  });
});

describe.each(Object.entries(docs))("texto legal: %s", (_, doc) => {
  const text = JSON.stringify(doc);
  it("no tiene marcadores rotos", () => {
    const opens = (text.match(/\[\[/g) ?? []).length;
    const wellFormed = (text.match(/\[\[PENDIENTE[^\]]*\]\]/g) ?? []).length;
    expect(opens).toBe(wellFormed);
  });
  it("todos sus links internos apuntan a páginas que existen", () => {
    internalLinks(doc).forEach((href) => expect(ROUTES).toContain(href));
  });
  it("tiene secciones con contenido", () => {
    expect(doc.sections.length).toBeGreaterThan(2);
    doc.sections.forEach((s) => { expect(s.heading).not.toBe(""); expect(s.body.length).toBeGreaterThan(0); });
  });
  it("cuenta los datos pendientes", () => {
    expect(countPending(doc)).toBeGreaterThan(0);
  });
});

describe("textos obligatorios", () => {
  const all = JSON.stringify(devoluciones);
  it("devoluciones menciona los 10 días corridos y el botón", () => {
    expect(all).toContain("10 días corridos");
    expect(all).toContain("/arrepentimiento");
  });
  it("privacidad incluye la leyenda de la Ley 25.326", () => {
    expect(JSON.stringify(privacidad)).toContain("Ley Nº 25.326");
  });
});
