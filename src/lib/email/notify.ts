import type { SupabaseClient } from "@supabase/supabase-js";
import { getCourse } from "@/lib/courses";
import type { MpPayment } from "@/lib/mercadopago/api";
import type { OrderRow } from "@/lib/payments/process";
import { site } from "@/lib/site";
import { sendEmail } from "./send";
import { paymentMismatchEmail, purchaseConfirmationEmail, withdrawalNoticeEmail, withdrawalReceivedEmail } from "./templates";

type Send = typeof sendEmail;
type Env = Record<string, string | undefined>;

const siteUrl = (env: Env) => (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const owner = (env: Env) => env.NOTIFY_EMAIL || site.email; // quién recibe los avisos internos

export type WithdrawalInfo = { code: string; firstName: string; fullName: string; email: string; courses: string[]; reference: string | null; reason: string | null };

// Mail a la persona (con su código) y aviso a Iara. Devuelve si el mail a la persona salió.
export async function notifyWithdrawal(i: WithdrawalInfo, send: Send = sendEmail, env: Env = process.env): Promise<{ emailed: boolean }> {
  const names = i.courses.map((slug) => getCourse(slug)?.name ?? slug);
  const [toPerson] = await Promise.all([
    send({ to: i.email, ...withdrawalReceivedEmail({ name: i.firstName, code: i.code, courses: names }), replyTo: site.email, idempotencyKey: `arrepentimiento-${i.code}-persona` }),
    send({ to: owner(env), ...withdrawalNoticeEmail({ code: i.code, fullName: i.fullName, email: i.email, courses: names, reference: i.reference, reason: i.reason }), replyTo: i.email, idempotencyKey: `arrepentimiento-${i.code}-titular` }),
  ]);
  return { emailed: toPerson.sent };
}

// Confirmación de compra a quien pagó. Se llama una sola vez, cuando la orden pasa a "paga".
export async function notifyPurchase(db: SupabaseClient, order: OrderRow, send: Send = sendEmail, env: Env = process.env): Promise<void> {
  const [user, profile, course] = await Promise.all([
    db.auth.admin.getUserById(order.user_id),
    db.from("profiles").select("full_name").eq("id", order.user_id).maybeSingle(),
    db.from("courses").select("slug, name").eq("id", order.course_id).maybeSingle(),
  ]);
  const to = user.data?.user?.email;
  const c = course.data as { slug: string; name: string } | null;
  if (!to || !c) return;
  const fullName = (profile.data as { full_name?: string } | null)?.full_name ?? "";
  await send({
    to,
    ...purchaseConfirmationEmail({ name: fullName.split(" ")[0] || "¡hola!", courseName: c.name, courseSlug: c.slug, amount: Number(order.amount), siteUrl: siteUrl(env) }),
    replyTo: site.email,
    idempotencyKey: `compra-${order.id}`,
  });
}

export async function notifyMismatch(order: OrderRow, payment: MpPayment, send: Send = sendEmail, env: Env = process.env): Promise<void> {
  await send({
    to: owner(env),
    ...paymentMismatchEmail({ paymentId: String(payment.id), orderId: order.id, expected: Number(order.amount), received: Number(payment.transaction_amount), currency: payment.currency_id }),
    idempotencyKey: `desajuste-${payment.id}`,
  });
}
