import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PaymentsRepo } from "./process";

// Cliente con permisos totales: SOLO en el servidor. Nunca importar desde componentes de cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const check = ({ error }: { error: { message: string } | null }) => {
  if (error) throw new Error(error.message);
};

export function supabaseRepo(db: SupabaseClient): PaymentsRepo {
  return {
    async getOrder(id) {
      const { data, error } = await db.from("orders").select("id,user_id,course_id,amount,currency,status").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    async upsertPayment(p) {
      check(await db.from("payments").upsert(p, { onConflict: "provider,provider_payment_id" }));
    },
    async setOrderStatus(id, status) {
      check(await db.from("orders").update({ status }).eq("id", id));
    },
    async grantEnrollment(e) {
      check(await db.from("enrollments").upsert({ ...e, status: "active", revoked_at: null }, { onConflict: "user_id,course_id" }));
    },
    async revokeEnrollment(orderId) {
      check(await db.from("enrollments").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("order_id", orderId));
    },
  };
}
