const BASE = "https://api.mercadopago.com";

export type MpPayment = {
  id: number | string;
  status: string;
  status_detail?: string | null;
  external_reference?: string | null;
  transaction_amount: number;
  currency_id: string;
};

function headers() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function createPreference(input: {
  orderId: string; title: string; amount: number; payerEmail?: string; siteUrl: string;
}): Promise<{ id: string; init_point: string }> {
  const { orderId, siteUrl } = input;
  const isPublic = siteUrl.startsWith("https://"); // MP exige URLs públicas para avisos y auto-retorno
  const res = await fetch(`${BASE}/checkout/preferences`, {
    method: "POST",
    headers: { ...headers(), "X-Idempotency-Key": orderId },
    body: JSON.stringify({
      items: [{ id: orderId, title: input.title, quantity: 1, unit_price: input.amount, currency_id: "ARS" }],
      payer: input.payerEmail ? { email: input.payerEmail } : undefined,
      external_reference: orderId, // vuelve en el aviso: así sabemos qué orden se pagó
      back_urls: {
        success: `${siteUrl}/compra/resultado?order=${orderId}`,
        pending: `${siteUrl}/compra/resultado?order=${orderId}`,
        failure: `${siteUrl}/compra/resultado?order=${orderId}`,
      },
      ...(isPublic && { auto_return: "approved", notification_url: `${siteUrl}/api/webhooks/mercadopago` }),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Mercado Pago (preferencia): HTTP ${res.status}`);
  return res.json();
}

// Siempre se consulta el pago a la API: nunca se confía en lo que trae el aviso.
export async function getPayment(id: string): Promise<MpPayment | null> {
  const res = await fetch(`${BASE}/v1/payments/${encodeURIComponent(id)}`, {
    headers: headers(),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Mercado Pago (pago): HTTP ${res.status}`);
  return res.json();
}
