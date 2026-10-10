import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { checkWithdrawalLimits, LIMIT_MESSAGES, LIMITS } from "./withdrawal-limits";

type Result = { count: number | null; error: unknown };
// Simula las dos consultas: por mail (select→eq→gte) y general (select→gte).
function fakeDb(email: Result, overall: Result) {
  const calls: { eq?: [string, string]; gte: string[] } = { gte: [] };
  const db = {
    from: () => ({
      select: () => ({
        eq: (col: string, val: string) => { calls.eq = [col, val]; return { gte: async (_c: string, since: string) => { calls.gte.push(since); return email; } }; },
        gte: async (_c: string, since: string) => { calls.gte.push(since); return overall; },
      }),
    }),
  } as unknown as SupabaseClient;
  return { db, calls };
}
const ok = (count: number): Result => ({ count, error: null });
const NOW = new Date("2026-10-11T12:00:00Z");

describe("checkWithdrawalLimits", () => {
  it("una solicitud normal pasa", async () => {
    expect(await checkWithdrawalLimits(fakeDb(ok(0), ok(0)).db, "a@b.com", NOW)).toBe("ok");
  });

  it("deja pasar hasta el máximo por mail y frena en el siguiente", async () => {
    expect(await checkWithdrawalLimits(fakeDb(ok(LIMITS.perEmailPerDay - 1), ok(0)).db, "a@b.com", NOW)).toBe("ok");
    expect(await checkWithdrawalLimits(fakeDb(ok(LIMITS.perEmailPerDay), ok(0)).db, "a@b.com", NOW)).toBe("email");
  });

  it("frena cuando hay demasiadas solicitudes en la hora, de cualquier mail", async () => {
    expect(await checkWithdrawalLimits(fakeDb(ok(0), ok(LIMITS.globalPerHour - 1)).db, "a@b.com", NOW)).toBe("ok");
    expect(await checkWithdrawalLimits(fakeDb(ok(0), ok(LIMITS.globalPerHour)).db, "a@b.com", NOW)).toBe("global");
  });

  it("cuenta por el mail pedido y en las ventanas correctas (24 horas y 1 hora)", async () => {
    const { db, calls } = fakeDb(ok(0), ok(0));
    await checkWithdrawalLimits(db, "camila@mail.com", NOW);
    expect(calls.eq).toEqual(["email", "camila@mail.com"]);
    expect(calls.gte).toContain("2026-10-10T12:00:00.000Z");
    expect(calls.gte).toContain("2026-10-11T11:00:00.000Z");
  });

  it("si no se puede consultar la base, NO bloquea (es un derecho: se deja pasar)", async () => {
    expect(await checkWithdrawalLimits(fakeDb({ count: null, error: { message: "db caída" } }, { count: null, error: { message: "db caída" } }).db, "a@b.com", NOW)).toBe("ok");
    const boom = { from: () => { throw new Error("boom"); } } as unknown as SupabaseClient;
    expect(await checkWithdrawalLimits(boom, "a@b.com", NOW)).toBe("ok");
  });

  it("los mensajes de bloqueo siempre ofrecen WhatsApp como salida", () => {
    for (const msg of Object.values(LIMIT_MESSAGES)) expect(msg).toMatch(/WhatsApp/);
  });
});
