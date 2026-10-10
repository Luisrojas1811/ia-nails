import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { courses } from "./courses";
import { indexingAllowed, PRIVATE_PATHS, robotsMeta, siteUrl } from "./seo";

afterEach(() => vi.unstubAllEnvs());

describe("indexingAllowed", () => {
  it("por defecto está bloqueado", () => expect(indexingAllowed({})).toBe(false));
  it("solo se abre con ALLOW_INDEXING=true", () => {
    expect(indexingAllowed({ ALLOW_INDEXING: "true" })).toBe(true);
    for (const v of ["false", "1", "yes", "TRUE", ""]) expect(indexingAllowed({ ALLOW_INDEXING: v }), v).toBe(false);
  });
  it("un despliegue de prueba (preview) nunca se indexa, aunque esté prendido", () => {
    expect(indexingAllowed({ ALLOW_INDEXING: "true", VERCEL_ENV: "preview" })).toBe(false);
    expect(indexingAllowed({ ALLOW_INDEXING: "true", VERCEL_ENV: "production" })).toBe(true);
  });
  it("robotsMeta refleja lo mismo", () => {
    expect(robotsMeta({})).toEqual({ index: false, follow: false });
    expect(robotsMeta({ ALLOW_INDEXING: "true" })).toEqual({ index: true, follow: true });
  });
});

describe("siteUrl", () => {
  it("usa la variable y le saca la barra final", () => expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://ianails.com.ar/" })).toBe("https://ianails.com.ar"));
  it("sin variable usa la dirección de producción de Vercel", () => expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "ia-nails.vercel.app" })).toBe("https://ia-nails.vercel.app"));
  it("sin nada usa localhost", () => expect(siteUrl({})).toBe("http://localhost:3000"));
});

describe("robots.txt", () => {
  it("bloqueado: prohíbe todo y no publica el mapa del sitio", () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(r.sitemap).toBeUndefined();
  });
  it("abierto: permite el sitio, esconde lo privado y apunta al mapa", () => {
    vi.stubEnv("ALLOW_INDEXING", "true"); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ianails.com.ar");
    const r = robots();
    expect(r.rules).toMatchObject({ allow: "/", disallow: PRIVATE_PATHS });
    expect(r.sitemap).toBe("https://ianails.com.ar/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ianails.com.ar");
  const urls = () => sitemap().map((e) => e.url);
  it("incluye el inicio, las páginas legales y todos los cursos", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ianails.com.ar");
    const list = urls();
    expect(list).toContain("https://ianails.com.ar/");
    expect(list).toContain("https://ianails.com.ar/terminos");
    courses.forEach((c) => expect(list).toContain(`https://ianails.com.ar/cursos/${c.slug}`));
  });
  it("no incluye ninguna página privada ni repite direcciones", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ianails.com.ar");
    const list = urls();
    for (const p of PRIVATE_PATHS) expect(list.some((u) => u.includes(p.replace(/\/$/, ""))), p).toBe(false);
    expect(new Set(list).size).toBe(list.length);
  });
});

describe("las páginas privadas tienen su propio noindex", () => {
  it.each([
    "src/app/(auth)/ingresar/page.tsx", "src/app/(auth)/registro/page.tsx", "src/app/(auth)/recuperar/page.tsx",
    "src/app/(auth)/actualizar-contrasena/page.tsx", "src/app/mis-cursos/page.tsx", "src/app/mis-cursos/[slug]/page.tsx", "src/app/compra/resultado/page.tsx",
  ])("%s", (file) => {
    expect(readFileSync(file, "utf8")).toMatch(/robots:\s*\{\s*index:\s*false/);
  });
});
