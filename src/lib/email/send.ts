// Envío de mails con Resend (https://resend.com), sin librerías extra.
// REGLA: un mail que falla NUNCA debe romper una compra ni un formulario. Esta función no lanza errores.
const ENDPOINT = "https://api.resend.com/emails";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string; idempotencyKey?: string };
export type SendResult = { sent: true; id?: string } | { sent: false; reason: "not_configured" | "invalid_recipient" | "failed" };

export async function sendEmail(
  msg: EmailMessage,
  env: Record<string, string | undefined> = process.env,
  fetchFn: typeof fetch = fetch,
): Promise<SendResult> {
  const key = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;
  if (!key || !from) return { sent: false, reason: "not_configured" }; // todavía sin dominio/clave: la web sigue funcionando
  if (!EMAIL_RE.test(msg.to)) return { sent: false, reason: "invalid_recipient" };

  try {
    const res = await fetchFn(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "User-Agent": "ia-nails/1.0", // Resend rechaza pedidos sin User-Agent
        // Evita mails duplicados si el pedido se repite (por ejemplo, cuando Mercado Pago reenvía un aviso).
        ...(msg.idempotencyKey && { "Idempotency-Key": msg.idempotencyKey }),
      },
      body: JSON.stringify({
        from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text,
        ...(msg.replyTo && { reply_to: msg.replyTo }),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // 401/403 = clave inválida o dominio sin verificar. No se registra el destinatario ni el contenido.
      console.error(`[email] Resend respondió ${res.status}`);
      return { sent: false, reason: "failed" };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: data.id };
  } catch {
    console.error("[email] no se pudo contactar a Resend");
    return { sent: false, reason: "failed" };
  }
}
