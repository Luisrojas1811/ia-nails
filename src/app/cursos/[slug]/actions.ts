"use server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/payments/repo";
import { createPreference, pickCheckoutUrl } from "@/lib/mercadopago/api";
import type { AuthState } from "@/lib/auth";

export async function startCheckout(_: AuthState, fd: FormData): Promise<AuthState> {
  const slug = String(fd.get("slug") ?? "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "Curso no válido." };

  const user = await getUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(`/cursos/${slug}`)}`);

  let checkoutUrl: string;
  try {
    const db = createAdminClient();
    // El precio sale de la base de datos, nunca del navegador.
    const { data: course } = await db.from("courses").select("id,name,price_ars").eq("slug", slug).eq("is_published", true).maybeSingle();
    if (!course) return { error: "Este curso no está disponible por el momento." };

    const { data: owned } = await db.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", course.id).eq("status", "active").maybeSingle();
    if (owned) redirect("/mis-cursos");

    const { data: order, error } = await db.from("orders").insert({ user_id: user.id, course_id: course.id, amount: course.price_ars }).select("id").single();
    if (error || !order) throw new Error(error?.message ?? "no se creó la orden");

    const pref = await createPreference({
      orderId: order.id,
      title: course.name,
      amount: Number(course.price_ars),
      payerEmail: user.email ?? undefined,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    });
    const url = pickCheckoutUrl(pref, process.env.MP_USE_SANDBOX === "true");
    if (!url?.startsWith("https://")) throw new Error("URL de pago inválida");
    checkoutUrl = url;
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e; // redirect() de arriba
    console.error("[checkout]", e);
    return { error: "No pudimos iniciar el pago. Probá de nuevo en unos minutos." };
  }
  redirect(checkoutUrl);
}
