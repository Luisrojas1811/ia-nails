import { createHmac, timingSafeEqual } from "node:crypto";

// Valida el header x-signature de los avisos de Mercado Pago.
// Manifest oficial: id:<data.id>;request-id:<x-request-id>;ts:<ts>;  (HMAC-SHA256 en hexa)
export function verifyWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string | undefined;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = input;
  if (!xSignature || !dataId || !secret) return false;

  let ts: string | undefined;
  let v1: string | undefined;
  for (const part of xSignature.split(",")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key === "ts") ts = value;
    else if (key === "v1") v1 = value;
  }
  if (!ts || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};${xRequestId ? `request-id:${xRequestId};` : ""}ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(v1, "hex"));
}
