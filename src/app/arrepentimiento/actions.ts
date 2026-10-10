"use server";
import { createAdminClient } from "@/lib/payments/repo";
import { courses } from "@/lib/courses";
import { makeWithdrawalCode, type WithdrawalState } from "@/lib/withdrawal";
import { notifyWithdrawal } from "@/lib/email/notify";
import { checkWithdrawalLimits, LIMIT_MESSAGES } from "@/lib/withdrawal-limits";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KNOWN = new Set(courses.map((c) => c.slug));
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// Sin sesión ni registro (lo exige la normativa). El motivo es OPCIONAL: no se puede pedir justificación.
export async function requestWithdrawal(_: WithdrawalState, fd: FormData): Promise<WithdrawalState> {
  const values = {
    first_name: text(fd, "first_name"),
    last_name: text(fd, "last_name"),
    email: text(fd, "email"),
    order_ref: text(fd, "order_ref"),
    reason: text(fd, "reason"),
    courses: fd.getAll("courses").map(String).filter((s) => KNOWN.has(s)),
  };
  const fail = (error: string): WithdrawalState => ({ error, values });

  // Trampa para bots: un campo oculto que una persona nunca completa. Se les simula éxito sin guardar nada.
  if (text(fd, "website")) return { code: makeWithdrawalCode() };

  if (values.first_name.length < 2 || values.first_name.length > 80) return fail("Ingresá tu nombre.");
  if (values.last_name.length < 2 || values.last_name.length > 80) return fail("Ingresá tu apellido.");
  if (!EMAIL_RE.test(values.email) || values.email.length > 200) return fail("Ingresá un email válido.");
  if (values.courses.length === 0) return fail("Elegí al menos un curso.");
  if (values.order_ref.length > 100) return fail("El número de compra es demasiado largo.");
  if (values.reason.length > 1000) return fail("El texto no puede superar los 1.000 caracteres.");

  try {
    const db = createAdminClient();
    const emailKey = values.email.toLowerCase(); // "Camila@Mail.com" y "camila@mail.com" cuentan como el mismo
    const limit = await checkWithdrawalLimits(db, emailKey);
    if (limit !== "ok") return fail(LIMIT_MESSAGES[limit]);
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = makeWithdrawalCode();
      const { error } = await db.from("withdrawal_requests").insert({
        code,
        full_name: `${values.first_name} ${values.last_name}`,
        email: emailKey,
        reference: values.order_ref || null,
        course_slugs: values.courses,
        reason: values.reason || null,
      });
      if (!error) {
        // El mail con el código sale aparte: si falla, la solicitud ya quedó registrada y se muestra el código en pantalla.
        const emailed = await notifyWithdrawal({
          code, firstName: values.first_name, fullName: `${values.first_name} ${values.last_name}`, email: emailKey,
          courses: values.courses, reference: values.order_ref || null, reason: values.reason || null,
        }).then((r) => r.emailed, () => false);
        return { code, emailed };
      }
      if (error.code !== "23505") throw new Error(error.message); // 23505 = código repetido: reintenta
    }
    throw new Error("no se pudo generar un código único");
  } catch (e) {
    console.error("[arrepentimiento]", e);
    return fail("No pudimos registrar tu solicitud. Escribinos por WhatsApp para gestionarla.");
  }
}
