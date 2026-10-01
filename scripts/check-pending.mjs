// Lista lo que falta completar antes del lanzamiento. Uso: npm run check:launch
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);

const found = [];
for (const file of walk("src/content")) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/\[\[(PENDIENTE[^\]]*)\]\]/g)) found.push(`${file}:${i + 1}  ${m[1]}`);
  });
}
if (found.length) {
  console.log(`Faltan ${found.length} datos antes de lanzar:\n\n${found.join("\n")}`);
  process.exit(1);
}
console.log("Sin datos pendientes en los textos legales.");
