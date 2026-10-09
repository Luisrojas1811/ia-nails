import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

const isSource = (f: string) => /\.(ts|tsx)$/.test(f) && !/\.test\.(ts|tsx)$/.test(f);
const envVars = [...new Set(
  walk("src").filter(isSource).flatMap((f) => [...readFileSync(f, "utf8").matchAll(/\benv\.([A-Z][A-Z0-9_]{3,})/g)].map((m) => m[1])),
)].filter((v) => v !== "NODE_ENV").sort();

const example = readFileSync(".env.example", "utf8");
const readme = readFileSync("README.md", "utf8");

describe("la documentación coincide con el código", () => {
  it("se detectan las variables de entorno", () => expect(envVars.length).toBeGreaterThanOrEqual(10));

  it.each(envVars)("la variable %s está en .env.example y en el README", (name) => {
    expect(example, `.env.example no menciona ${name}`).toMatch(new RegExp(`^${name}=`, "m"));
    expect(readme, `README.md no menciona ${name}`).toContain(`\`${name}\``);
  });

  const docs = ["README.md", ...readdirSync("docs").map((f) => `docs/${f}`)].filter((f) => f.endsWith(".md"));
  it.each(docs)("%s no menciona archivos que no existen", (file) => {
    const text = readFileSync(file, "utf8");
    const mentioned = [...text.matchAll(/`((?:src|docs|supabase|scripts|public|\.github)\/[^`\s]+)`/g)].map((m) => m[1]);
    const real = mentioned.filter((p) => !/[<>*]|\.\.\./.test(p)).map((p) => p.replace(/\/$/, ""));
    const missing = real.filter((p) => !existsSync(p));
    expect(missing, `en ${file}`).toEqual([]);
  });

  it("los links entre guías apuntan a archivos que existen", () => {
    const links = [...readme.matchAll(/\]\((docs\/[^)]+\.md)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThanOrEqual(5);
    links.forEach((l) => expect(existsSync(l), l).toBe(true));
  });
});
