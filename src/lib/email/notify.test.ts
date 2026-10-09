import { describe, expect, it, vi } from "vitest";
import type { MpPayment } from "@/lib/mercadopago/api";
import type { OrderRow } from "@/lib/payments/process";
import { notifyMismatch, notifyPurchase, notifyWithdrawal } from "./notify";
import type { EmailMessage, SendResult } from "./send";

const okSend = () => vi.fn<(msg: EmailMessage) => Promise<SendResult>>(async () => ({ sent: true }));
const env = { NEXT_PUBLIC_SITE_URL: "https://ianails.com.ar/", NOTIFY_EMAIL: "iara@mail.com" };
const info = { code: "ARR-1", firstName: "Camila", fullName: "Camila Navarro", email: "camila@mail.com", courses: ["capping-polygel"], reference: null, reason: null };
const order = { id: "o-1", user_id: "u-1", course_id: "c-1", amount: 25000, currency: "ARS", status: "pending" } as OrderRow;

function fakeDb(email: string | null = "camila@mail.com") {
  return {
    auth: { admin: { getUserById: async () => ({ data: { user: email ? { email } : null } }) } },
    from: (table: string) => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: table === "profiles" ? { full_name: "Camila Navarro" } : { slug: "capping-polygel", name: "Capping Polygel" } }) }) }) }),
  } as never;
}

describe("notifyWithdrawal", () => {
  it("manda el código a la persona y el aviso al titular", async () => {
    const send = okSend();
    expect(await notifyWithdrawal(info, send, env)).toEqual({ emailed: true });
    const [toPerson, toOwner] = send.mock.calls.map((c) => c[0] as unknown as Record<string, string>);
    expect(toPerson.to).toBe("camila@mail.com");
    expect(toPerson.subject).toContain("ARR-1");
    expect(toOwner.to).toBe("iara@mail.com");
    expect(toOwner.replyTo).toBe("camila@mail.com"); // al responder, le escribe a la persona
  });
  it("si no hay NOTIFY_EMAIL, el aviso va al mail de contacto del sitio", async () => {
    const send = okSend();
    await notifyWithdrawal(info, send, {});
    expect((send.mock.calls[1][0] as unknown as { to: string }).to).toBe("ianailsss10@gmail.com");
  });
  it("si el mail a la persona falla, lo informa y el aviso al titular igual se intenta", async () => {
    const send = vi.fn(async (m: { to: string }): Promise<SendResult> => (m.to === "camila@mail.com" ? { sent: false, reason: "failed" } : { sent: true }));
    expect(await notifyWithdrawal(info, send as never, env)).toEqual({ emailed: false });
    expect(send).toHaveBeenCalledTimes(2);
  });
  it("sin configuración de mail devuelve emailed=false sin romper", async () => {
    const send = vi.fn(async (): Promise<SendResult> => ({ sent: false, reason: "not_configured" }));
    expect(await notifyWithdrawal(info, send, env)).toEqual({ emailed: false });
  });
});

describe("notifyPurchase", () => {
  it("manda la confirmación a quien compró, con link al curso y clave contra duplicados", async () => {
    const send = okSend();
    await notifyPurchase(fakeDb(), order, send, env);
    const m = send.mock.calls[0][0] as unknown as Record<string, string>;
    expect(m.to).toBe("camila@mail.com");
    expect(m.html).toContain("https://ianails.com.ar/mis-cursos/capping-polygel");
    expect(m.html).toContain("Hola Camila");
    expect(m.idempotencyKey).toBe("compra-o-1");
  });
  it("si no encuentra el mail de la persona, no manda nada", async () => {
    const send = okSend();
    await notifyPurchase(fakeDb(null), order, send, env);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("notifyMismatch", () => {
  it("avisa al titular con los montos", async () => {
    const send = okSend();
    await notifyMismatch(order, { id: 777, status: "approved", transaction_amount: 1, currency_id: "ARS" } as MpPayment, send, env);
    const m = send.mock.calls[0][0] as unknown as Record<string, string>;
    expect(m.to).toBe("iara@mail.com");
    expect(m.text).toContain("777");
  });
});
