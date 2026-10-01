import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/mercadopago/signature";
import { getPayment } from "@/lib/mercadopago/api";
import { processPayment } from "@/lib/payments/process";
import { createAdminClient, supabaseRepo } from "@/lib/payments/repo";

const ok = () => new NextResponse(null, { status: 200 });

export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const dataId = params.get("data.id");

  const valid = verifyWebhookSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret: process.env.MP_WEBHOOK_SECRET,
  });
  if (!valid) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  // Solo nos interesan los pagos; el resto se confirma con 200 para que MP no reintente.
  const type = params.get("type") ?? params.get("topic");
  if (type !== "payment" || !dataId || !/^\d+$/.test(dataId)) return ok();

  try {
    const payment = await getPayment(dataId);
    if (!payment) return ok(); // p. ej. la notificación de prueba del panel de MP
    const db = createAdminClient();
    const result = await processPayment(payment, supabaseRepo(db));
    if (result === "amount_mismatch") console.error(`[MP] monto o moneda no coinciden: pago ${dataId}. Revisar a mano.`);
    await db.from("webhook_events").upsert(
      { provider: "mercadopago", event_key: `payment:${dataId}:${request.headers.get("x-request-id") ?? "s/id"}`, payload: { result }, processed_at: new Date().toISOString() },
      { onConflict: "provider,event_key", ignoreDuplicates: true },
    );
    return ok();
  } catch (e) {
    console.error("[MP] error procesando aviso", e);
    return NextResponse.json({ error: "error interno" }, { status: 500 }); // MP reintenta
  }
}
