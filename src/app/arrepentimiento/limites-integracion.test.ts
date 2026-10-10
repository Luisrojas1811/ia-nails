import { beforeEach, describe, expect, it, vi } from "vitest";

// Base de datos en memoria que guarda lo que se inserta y cuenta de verdad: prueba el freno de punta a punta.
const rows: { email: string; created_at: string }[] = [];
const count = (pred: (r: (typeof rows)[number]) => boolean) => ({ count: rows.filter(pred).length, error: null });
vi.mock("@/lib/payments/repo", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: async (r: { email: string }) => { rows.push({ email: r.email, created_at: new Date().toISOString() }); return { error: null }; },
      select: () => ({
        eq: (_col: string, email: string) => ({ gte: async (_c: string, since: string) => count((r) => r.email === email && r.created_at >= since) }),
        gte: async (_c: string, since: string) => count((r) => r.created_at >= since),
      }),
    }),
  }),
}));
vi.mock("@/lib/email/notify", () => ({ notifyWithdrawal: vi.fn(async () => ({ emailed: false })) }));

import { requestWithdrawal } from "./actions";
import { LIMITS } from "@/lib/withdrawal-limits";

const form = (email: string) => {
  const fd = new FormData();
  fd.set("first_name", "Camila"); fd.set("last_name", "Navarro"); fd.set("email", email); fd.append("courses", "capping-polygel");
  return fd;
};

beforeEach(() => { rows.length = 0; });

describe("freno contra el spam, de punta a punta", () => {
  it("el mismo mail puede pedir hasta el límite por día y después se frena (sin importar mayúsculas)", async () => {
    for (let i = 0; i < LIMITS.perEmailPerDay; i++) expect((await requestWithdrawal({}, form(i % 2 ? "CAMILA@mail.com" : "camila@mail.com"))).code, `pedido ${i + 1}`).toBeTruthy();
    const blocked = await requestWithdrawal({}, form("Camila@Mail.com"));
    expect(blocked.code).toBeUndefined();
    expect(blocked.error).toMatch(/WhatsApp/);
    expect(rows).toHaveLength(LIMITS.perEmailPerDay); // el bloqueado no se guardó
  });

  it("otra persona no se ve afectada por el límite de un mail", async () => {
    for (let i = 0; i < LIMITS.perEmailPerDay; i++) await requestWithdrawal({}, form("camila@mail.com"));
    expect((await requestWithdrawal({}, form("otra@mail.com"))).code).toBeTruthy();
  });

  it("si llegan demasiadas por hora de mails distintos (un ataque), se frena el total", async () => {
    for (let i = 0; i < LIMITS.globalPerHour; i++) expect((await requestWithdrawal({}, form(`persona${i}@mail.com`))).code, `pedido ${i + 1}`).toBeTruthy();
    const blocked = await requestWithdrawal({}, form("una-mas@mail.com"));
    expect(blocked.error).toMatch(/muchas solicitudes/);
    expect(blocked.error).toMatch(/WhatsApp/);
    expect(rows).toHaveLength(LIMITS.globalPerHour);
  });
});
