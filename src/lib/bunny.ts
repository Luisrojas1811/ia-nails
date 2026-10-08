import { createHash } from "node:crypto";

// Firma el link del video en el SERVIDOR: la clave nunca llega al navegador.
// Fórmula oficial de Bunny: token = SHA256_HEX(clave + id_del_video + vencimiento)
const BASE = "https://iframe.mediadelivery.net/embed";
const TTL_SECONDS = 2 * 60 * 60;

export function signBunnyEmbed(opts: { libraryId: string; videoId: string; key: string; nowMs?: number; ttlSeconds?: number }) {
  const expires = Math.floor((opts.nowMs ?? Date.now()) / 1000) + (opts.ttlSeconds ?? TTL_SECONDS);
  const token = createHash("sha256").update(`${opts.key}${opts.videoId}${expires}`).digest("hex");
  return `${BASE}/${opts.libraryId}/${opts.videoId}?token=${token}&expires=${expires}`;
}

// Devuelve null (y la pantalla muestra "video próximamente") si falta algún dato o si algo no tiene el formato esperado.
export function bunnyEmbedFor(videoId: string | null | undefined, env: Record<string, string | undefined> = process.env, nowMs?: number) {
  const libraryId = env.BUNNY_STREAM_LIBRARY_ID;
  const key = env.BUNNY_STREAM_TOKEN_AUTH_KEY;
  if (!videoId || !libraryId || !key) return null;
  if (!/^\d+$/.test(libraryId) || !/^[0-9a-f-]{36}$/i.test(videoId)) return null; // evita armar URLs raras
  return signBunnyEmbed({ libraryId, videoId, key, nowMs });
}
