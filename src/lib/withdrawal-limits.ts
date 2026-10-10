import type { SupabaseClient } from "@supabase/supabase-js";

// Freno contra el spam del botón de arrepentimiento (que por ley no puede pedir cuenta).
// Cuenta las solicitudes ya guardadas: no necesita servicios externos.
export const LIMITS = { perEmailPerDay: 3, globalPerHour: 20 } as const;

export type LimitResult = "ok" | "email" | "global";

// Siempre dan una salida (WhatsApp): el arrepentimiento es un derecho y nunca se deja a una persona sin camino.
export const LIMIT_MESSAGES = {
  email: "Ya recibimos varias solicitudes con este email. Escribinos por WhatsApp y lo resolvemos enseguida.",
  global: "Estamos recibiendo muchas solicitudes en este momento. Probá de nuevo en unos minutos o escribinos por WhatsApp.",
} as const;

export async function checkWithdrawalLimits(db: SupabaseClient, email: string, now = new Date()): Promise<LimitResult> {
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  try {
    const [byEmail, overall] = await Promise.all([
      db.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", dayAgo),
      db.from("withdrawal_requests").select("id", { count: "exact", head: true }).gte("created_at", hourAgo),
    ]);
    // Si no se pudo consultar, se deja pasar: no se bloquea un derecho por una falla nuestra.
    if (!byEmail.error && (byEmail.count ?? 0) >= LIMITS.perEmailPerDay) return "email";
    if (!overall.error && (overall.count ?? 0) >= LIMITS.globalPerHour) return "global";
  } catch {
    /* sin datos: se deja pasar */
  }
  return "ok";
}
