import { beforeEach, describe, expect, it } from "vitest";
import type { MpPayment } from "@/lib/mercadopago/api";
import { processPayment, type OrderRow, type PaymentsRepo } from "./process";
import { orderStatusFor } from "./status";

const ORDER_ID = "6f1c1c8e-6a2e-4b7e-9c43-0b1f3c2d4a5b";

// Repositorio en memoria que imita a la base de datos.
function fakeRepo(order: Partial<OrderRow> | null) {
  const state = {
    order: order ? ({ id: ORDER_ID, user_id: "u1", course_id: "c1", amount: 25000, currency: "ARS", status: "pending", ...order } as OrderRow) : null,
    payments: new Map<string, string>(),
    enrollment: null as null | "active" | "revoked",
  };
  const repo: PaymentsRepo = {
    getOrder: async (id) => (state.order && state.order.id === id ? { ...state.order } : null),
    upsertPayment: async (p) => { state.payments.set(p.provider_payment_id, p.status); },
    setOrderStatus: async (_, status) => { if (state.order) state.order.status = status; },
    grantEnrollment: async () => { state.enrollment = "active"; },
    revokeEnrollment: async () => { state.enrollment = "revoked"; },
  };
  return { repo, state };
}

const pay = (over: Partial<MpPayment> = {}): MpPayment => ({
  id: 111, status: "approved", external_reference: ORDER_ID, transaction_amount: 25000, currency_id: "ARS", ...over,
});

describe("processPayment", () => {
  let ctx: ReturnType<typeof fakeRepo>;
  beforeEach(() => { ctx = fakeRepo({}); });

  it("pago aprobado: marca la orden como paga y habilita el curso", async () => {
    expect(await processPayment(pay(), ctx.repo)).toBe("processed");
    expect(ctx.state.order?.status).toBe("paid");
    expect(ctx.state.enrollment).toBe("active");
    expect(ctx.state.payments.get("111")).toBe("approved");
  });

  it("es idempotente: el mismo aviso repetido deja el mismo resultado", async () => {
    await processPayment(pay(), ctx.repo);
    await processPayment(pay(), ctx.repo);
    expect(ctx.state.order?.status).toBe("paid");
    expect(ctx.state.enrollment).toBe("active");
    expect(ctx.state.payments.size).toBe(1);
  });

  it("completa el acceso si una ejecución anterior se cortó después de marcar la orden", async () => {
    ctx = fakeRepo({ status: "paid" }); // orden ya paga, pero sin inscripción
    await processPayment(pay(), ctx.repo);
    expect(ctx.state.enrollment).toBe("active");
  });

  it("NO habilita si el monto no coincide", async () => {
    expect(await processPayment(pay({ transaction_amount: 1 }), ctx.repo)).toBe("amount_mismatch");
    expect(ctx.state.order?.status).toBe("pending");
    expect(ctx.state.enrollment).toBeNull();
    expect(ctx.state.payments.size).toBe(1); // queda registrado para revisarlo
  });

  it("NO habilita si la moneda no coincide", async () => {
    expect(await processPayment(pay({ currency_id: "USD" }), ctx.repo)).toBe("amount_mismatch");
    expect(ctx.state.enrollment).toBeNull();
  });

  it.each([undefined, null, "", "no-es-un-uuid", "1; drop table orders"])("ignora external_reference inválida (%s)", async (ref) => {
    expect(await processPayment(pay({ external_reference: ref as string | null }), ctx.repo)).toBe("ignored");
    expect(ctx.state.payments.size).toBe(0);
  });

  it("ignora pagos de órdenes que no existen", async () => {
    ctx = fakeRepo(null);
    expect(await processPayment(pay(), ctx.repo)).toBe("ignored");
  });

  it.each(["pending", "in_process", "authorized", "in_mediation"])("pago %s: la orden sigue pendiente y no hay acceso", async (status) => {
    await processPayment(pay({ status }), ctx.repo);
    expect(ctx.state.order?.status).toBe("pending");
    expect(ctx.state.enrollment).toBeNull();
  });

  it("pago rechazado sobre orden pendiente: la marca como fallida", async () => {
    await processPayment(pay({ status: "rejected" }), ctx.repo);
    expect(ctx.state.order?.status).toBe("failed");
    expect(ctx.state.enrollment).toBeNull();
  });

  it("un intento rechazado posterior NO le quita el acceso a una orden ya paga", async () => {
    await processPayment(pay({ id: 1 }), ctx.repo);
    await processPayment(pay({ id: 2, status: "rejected" }), ctx.repo);
    expect(ctx.state.order?.status).toBe("paid");
    expect(ctx.state.enrollment).toBe("active");
  });

  it("reintento aprobado después de un rechazo: habilita el curso", async () => {
    await processPayment(pay({ id: 1, status: "rejected" }), ctx.repo);
    await processPayment(pay({ id: 2 }), ctx.repo);
    expect(ctx.state.order?.status).toBe("paid");
    expect(ctx.state.enrollment).toBe("active");
  });

  it.each(["refunded", "charged_back"])("%s sobre una orden paga: revoca el acceso", async (status) => {
    await processPayment(pay(), ctx.repo);
    await processPayment(pay({ status }), ctx.repo);
    expect(ctx.state.order?.status).toBe("refunded");
    expect(ctx.state.enrollment).toBe("revoked");
  });

  it("un reembolso sobre una orden que nunca se pagó no toca nada", async () => {
    await processPayment(pay({ status: "refunded" }), ctx.repo);
    expect(ctx.state.order?.status).toBe("pending");
    expect(ctx.state.enrollment).toBeNull();
  });

  it("acepta el monto como texto numérico (numeric de Postgres)", async () => {
    ctx = fakeRepo({ amount: "25000.00" });
    await processPayment(pay(), ctx.repo);
    expect(ctx.state.order?.status).toBe("paid");
  });
});

describe("orderStatusFor", () => {
  it("una orden reembolsada no vuelve a 'paga' sola", () => {
    expect(orderStatusFor("refunded", "approved")).toBe("refunded");
  });
  it("cancelado solo aplica a órdenes pendientes", () => {
    expect(orderStatusFor("pending", "cancelled")).toBe("cancelled");
    expect(orderStatusFor("paid", "cancelled")).toBe("paid");
  });
});
