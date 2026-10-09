import { describe, expect, it, vi } from "vitest";
import { sendEmail } from "./send";

const env = { RESEND_API_KEY: "re_secreta", EMAIL_FROM: "IA Nails <hola@ianails.com.ar>" };
const msg = { to: "camila@mail.com", subject: "Hola", html: "<p>Hola</p>", text: "Hola" };
const ok = (body: unknown = { id: "abc123" }) => vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;

describe("sendEmail", () => {
  it("sin clave o sin remitente no envía ni falla (la web sigue funcionando)", async () => {
    const f = ok();
    expect(await sendEmail(msg, {}, f)).toEqual({ sent: false, reason: "not_configured" });
    expect(await sendEmail(msg, { RESEND_API_KEY: "x" }, f)).toEqual({ sent: false, reason: "not_configured" });
    expect(f).not.toHaveBeenCalled();
  });

  it("arma el pedido a Resend con clave, remitente y reply_to", async () => {
    const f = ok();
    const r = await sendEmail({ ...msg, replyTo: "iara@mail.com", idempotencyKey: "compra-1" }, env, f);
    expect(r).toEqual({ sent: true, id: "abc123" });
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_secreta");
    expect(headers["Idempotency-Key"]).toBe("compra-1");
    expect(headers["User-Agent"]).toBeTruthy();
    expect(JSON.parse(init.body as string)).toMatchObject({ from: env.EMAIL_FROM, to: ["camila@mail.com"], subject: "Hola", reply_to: "iara@mail.com" });
  });

  it("sin idempotencyKey ni replyTo no manda esos campos", async () => {
    const f = ok();
    await sendEmail(msg, env, f);
    const [, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBeUndefined();
    expect(JSON.parse(init.body as string).reply_to).toBeUndefined();
  });

  it.each(["", "sin-arroba", "a@b", "con espacio@mail.com"])("destinatario inválido (%j): no llama a Resend", async (to) => {
    const f = ok();
    expect(await sendEmail({ ...msg, to }, env, f)).toEqual({ sent: false, reason: "invalid_recipient" });
    expect(f).not.toHaveBeenCalled();
  });

  it.each([401, 403, 422, 429, 500])("si Resend responde %i no lanza error y devuelve failed", async (status) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const f = vi.fn(async () => new Response("{}", { status })) as unknown as typeof fetch;
    expect(await sendEmail(msg, env, f)).toEqual({ sent: false, reason: "failed" });
  });

  it("si la red falla no lanza error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const f = vi.fn(async () => { throw new Error("fetch failed"); }) as unknown as typeof fetch;
    expect(await sendEmail(msg, env, f)).toEqual({ sent: false, reason: "failed" });
  });

  it("no escribe en los registros la clave ni el destinatario", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await sendEmail(msg, env, vi.fn(async () => new Response("{}", { status: 403 })) as unknown as typeof fetch);
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).not.toContain("re_secreta");
    expect(logged).not.toContain("camila@mail.com");
  });
});
