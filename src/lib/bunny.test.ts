import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { bunnyEmbedFor, signBunnyEmbed } from "./bunny";

const VIDEO = "eb1c4f77-0cda-46be-b47d-1118ad7c2ffe";
const KEY = "4742a81b-bf15-42fe-8b1c-8fcb9024c550";
const NOW = Date.UTC(2026, 9, 10, 12, 0, 0);
const env = { BUNNY_STREAM_LIBRARY_ID: "759", BUNNY_STREAM_TOKEN_AUTH_KEY: KEY };

describe("signBunnyEmbed", () => {
  it("firma con SHA256(clave + id + vencimiento), como indica Bunny", () => {
    const url = new URL(signBunnyEmbed({ libraryId: "759", videoId: VIDEO, key: KEY, nowMs: NOW, ttlSeconds: 3600 }));
    const expires = Math.floor(NOW / 1000) + 3600;
    expect(url.origin + url.pathname).toBe(`https://iframe.mediadelivery.net/embed/759/${VIDEO}`);
    expect(url.searchParams.get("expires")).toBe(String(expires));
    expect(url.searchParams.get("token")).toBe(createHash("sha256").update(`${KEY}${VIDEO}${expires}`).digest("hex"));
  });

  it("el token cambia si cambia el video o el vencimiento", () => {
    const t = (v: string, n: number) => new URL(signBunnyEmbed({ libraryId: "759", videoId: v, key: KEY, nowMs: n })).searchParams.get("token");
    expect(t(VIDEO, NOW)).not.toBe(t("00000000-0000-0000-0000-000000000000", NOW));
    expect(t(VIDEO, NOW)).not.toBe(t(VIDEO, NOW + 10_000));
  });

  it("la clave secreta no aparece en el link", () => {
    expect(signBunnyEmbed({ libraryId: "759", videoId: VIDEO, key: KEY, nowMs: NOW })).not.toContain(KEY);
  });
});

describe("bunnyEmbedFor", () => {
  it("arma el link cuando hay video y configuración", () => expect(bunnyEmbedFor(VIDEO, env, NOW)).toMatch(/^https:\/\/iframe\.mediadelivery\.net\/embed\/759\//));
  it.each([null, undefined, ""])("sin video (%s) devuelve null", (v) => expect(bunnyEmbedFor(v, env, NOW)).toBeNull());
  it("sin configuración devuelve null", () => expect(bunnyEmbedFor(VIDEO, {}, NOW)).toBeNull());
  it("rechaza ids con formato raro (evita URLs manipuladas)", () => {
    expect(bunnyEmbedFor("../../evil", env, NOW)).toBeNull();
    expect(bunnyEmbedFor(VIDEO, { ...env, BUNNY_STREAM_LIBRARY_ID: "759/../x" }, NOW)).toBeNull();
  });
});
