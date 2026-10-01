import type { MpPayment } from "@/lib/mercadopago/api";
import { orderStatusFor, type OrderStatus } from "./status";

export type OrderRow = { id: string; user_id: string; course_id: string; amount: number | string; currency: string; status: OrderStatus };

export interface PaymentsRepo {
  getOrder(id: string): Promise<OrderRow | null>;
  upsertPayment(p: { order_id: string; provider_payment_id: string; status: string; status_detail: string | null; amount: number; raw: unknown }): Promise<void>;
  setOrderStatus(id: string, status: OrderStatus): Promise<void>;
  grantEnrollment(e: { user_id: string; course_id: string; order_id: string }): Promise<void>;
  revokeEnrollment(orderId: string): Promise<void>;
}

export type ProcessResult = "processed" | "ignored" | "amount_mismatch";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Idempotente: se puede ejecutar N veces con el mismo pago y el resultado es el mismo.
export async function processPayment(payment: MpPayment, repo: PaymentsRepo): Promise<ProcessResult> {
  const ref = payment.external_reference;
  if (!ref || !UUID.test(ref)) return "ignored";
  const order = await repo.getOrder(ref);
  if (!order) return "ignored";

  await repo.upsertPayment({
    order_id: order.id,
    provider_payment_id: String(payment.id),
    status: payment.status,
    status_detail: payment.status_detail ?? null,
    amount: Number(payment.transaction_amount),
    raw: payment,
  });

  // El monto y la moneda tienen que coincidir con lo que registramos al crear la orden.
  const matches = payment.currency_id === order.currency
    && Math.abs(Number(payment.transaction_amount) - Number(order.amount)) < 0.005;
  if (!matches) return "amount_mismatch";

  const next = orderStatusFor(order.status, payment.status);
  if (next !== order.status) await repo.setOrderStatus(order.id, next);
  if (payment.status === "approved" && next === "paid") {
    await repo.grantEnrollment({ user_id: order.user_id, course_id: order.course_id, order_id: order.id });
  }
  if (next === "refunded" && order.status !== "refunded") await repo.revokeEnrollment(order.id);
  return "processed";
}
