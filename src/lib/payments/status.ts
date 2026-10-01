export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

// Estado de la orden según el estado del pago en Mercado Pago.
// Nunca se "degrada" una orden ya pagada por un aviso de otro intento fallido.
export function orderStatusFor(current: OrderStatus, mpStatus: string): OrderStatus {
  switch (mpStatus) {
    case "approved":
      return current === "refunded" ? current : "paid"; // reembolsada: revisar a mano
    case "refunded":
    case "charged_back":
      return current === "paid" ? "refunded" : current;
    case "rejected":
      return current === "pending" ? "failed" : current;
    case "cancelled":
      return current === "pending" ? "cancelled" : current;
    default: // pending, in_process, authorized, in_mediation…
      return current;
  }
}
