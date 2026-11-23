// Convierte una planilla de clases (CSV) en el SQL para pegar en Supabase → SQL Editor.
// Uso: npm run clases -- clases.csv            (escribe clases.sql al lado)
// Columnas: curso,posicion,titulo,minutos,video_id
//   curso     slug del curso (ej.: capping-polygel)
//   posicion  1, 2, 3… dentro de cada curso
//   minutos   duración aproximada (puede quedar vacío)
//   video_id  Video ID de Bunny (puede quedar vacío y cargarse después)
// Si la clase ya existe en esa posición, se actualiza: sirve para corregir títulos o sumar el video.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Separa una línea de CSV respetando comillas ("Uñas, base y color"). Acepta coma o punto y coma (Excel en español). */
export function parseLine(line, sep = ",") {
  const out = []; let cur = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * @param {string} csv
 * @param {string[]} validSlugs
 * @returns {{ sql: string, errors: string[], count: number }}
 */
export function toSql(csv, validSlugs) {
  const lines = csv.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (!lines.length) return { sql: "", errors: ["La planilla está vacía."], count: 0 };
  const sep = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const header = parseLine(lines[0], sep).map((h) => h.toLowerCase());
  const col = (name) => header.indexOf(name);
  const errors = [];
  for (const name of ["curso", "posicion", "titulo"]) if (col(name) < 0) errors.push(`Falta la columna "${name}" en la primera fila.`);
  if (errors.length) return { sql: "", errors, count: 0 };

  const rows = []; const seen = new Set();
  lines.slice(1).forEach((line, i) => {
    const n = i + 2; const c = parseLine(line, sep);
    const get = (name) => (col(name) >= 0 ? c[col(name)] ?? "" : "");
    const slug = get("curso"); const pos = Number(get("posicion")); const title = get("titulo");
    const min = get("minutos").replace(",", "."); const video = get("video_id");
    if (!validSlugs.includes(slug)) errors.push(`Fila ${n}: el curso "${slug}" no existe. Opciones: ${validSlugs.join(", ")}.`);
    if (!Number.isInteger(pos) || pos < 1) errors.push(`Fila ${n}: la posición tiene que ser un número entero desde 1.`);
    if (!title) errors.push(`Fila ${n}: falta el título.`);
    if (min && !(Number(min) >= 0)) errors.push(`Fila ${n}: los minutos tienen que ser un número.`);
    if (video && !UUID.test(video)) errors.push(`Fila ${n}: el video_id no tiene el formato de Bunny (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).`);
    const key = `${slug}#${pos}`;
    if (seen.has(key)) errors.push(`Fila ${n}: la posición ${pos} está repetida en "${slug}".`);
    seen.add(key);
    rows.push({ slug, pos, title, seconds: min ? Math.round(Number(min) * 60) : null, video: video.toLowerCase() });
  });
  if (errors.length) return { sql: "", errors, count: 0 };

  const parts = rows.map((r) => {
    const lesson = `insert into public.lessons (course_id, position, title, duration_seconds)
select id, ${r.pos}, ${q(r.title)}, ${r.seconds ?? "null"} from public.courses where slug = ${q(r.slug)}
on conflict (course_id, position) do update set title = excluded.title, duration_seconds = excluded.duration_seconds`;
    if (!r.video) return `-- ${r.slug} · clase ${r.pos} (sin video todavía)\n${lesson};`;
    return `-- ${r.slug} · clase ${r.pos}
with l as (
${lesson}
  returning id
)
insert into public.lesson_videos (lesson_id, bunny_video_id) select id, ${q(r.video)} from l
on conflict (lesson_id) do update set bunny_video_id = excluded.bunny_video_id;`;
  });
  const sql = `-- Generado con: npm run clases. Pegar entero en Supabase → SQL Editor y tocar Run.
-- Si algo falla, no se guarda nada (todo va en una sola transacción).
begin;

${parts.join("\n\n")}

commit;
`;
  return { sql, errors: [], count: rows.length };
}

export function courseSlugs(coursesSource) {
  return [...coursesSource.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.log("Uso: npm run clases -- ruta/a/clases.csv   (ver el ejemplo en docs/clases-ejemplo.csv)"); process.exit(1); }
  const slugs = courseSlugs(readFileSync(new URL("../src/lib/courses.ts", import.meta.url), "utf8"));
  const { sql, errors, count } = toSql(readFileSync(file, "utf8"), slugs);
  if (errors.length) { console.log(`Hay que corregir la planilla:\n\n${errors.join("\n")}`); process.exit(1); }
  const out = file.replace(/\.csv$/i, "") + ".sql";
  writeFileSync(out, sql);
  console.log(`Listo: ${count} clases en ${out}. Abrilo, copiá todo y pegalo en Supabase → SQL Editor.`);
}
