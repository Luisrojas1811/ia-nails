import { formatPrice } from "@/lib/courses";
import { site } from "@/lib/site";

export type Built = { subject: string; html: string; text: string };

// Todo texto que viene de una persona se escapa: nadie puede meter HTML en un mail que recibe otra.
const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

const p = (s: string) => `<p style="margin:0 0 14px">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#000;color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:bold;font-size:13px;letter-spacing:.06em;text-transform:uppercase">${esc(label)}</a></p>`;

function layout(bodyHtml: string, footerHtml: string) {
  return `<div style="background:#faf9fb;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1c1d">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:#f0dbff;padding:20px 28px"><span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2c0051">${esc(site.name)}</span><br><span style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#4b454d">${esc(site.tagline)}</span></div>
<div style="padding:28px;font-size:15px;line-height:1.6">${bodyHtml}</div>
<div style="padding:16px 28px;background:#f4f3f5;font-size:12px;line-height:1.5;color:#4b454d">${footerHtml}</div>
</div></div>`;
}

const contactHtml = `${esc(site.name)} · ${esc(site.address.street)}, ${esc(site.address.area)}<br>WhatsApp ${esc(site.whatsappDisplay)} · ${esc(site.email)}`;
const contactText = `${site.name} · ${site.address.street}, ${site.address.area}\nWhatsApp ${site.whatsappDisplay} · ${site.email}`;

export function purchaseConfirmationEmail(i: { name: string; courseName: string; courseSlug: string; amount: number; siteUrl: string }): Built {
  const url = `${i.siteUrl}/mis-cursos/${i.courseSlug}`;
  const arrepentimiento = `${i.siteUrl}/arrepentimiento`;
  const subject = `¡Tu curso está listo! ${i.courseName}`;
  return {
    subject,
    html: layout(
      p(`Hola ${esc(i.name)},`) +
        p(`¡Gracias por tu compra! Ya podés empezar <strong>${esc(i.courseName)}</strong> desde tu cuenta.`) +
        button(url, "Ir a mi curso") +
        p(`Importe abonado: <strong>${esc(formatPrice(i.amount))}</strong>.`) +
        p("Si tenés alguna duda, respondé este mail o escribinos por WhatsApp."),
      `Si te arrepentís de tu compra, tenés 10 días corridos para pedirlo en <a href="${esc(arrepentimiento)}" style="color:#4b454d">${esc(arrepentimiento)}</a>.<br><br>${contactHtml}`,
    ),
    text: `Hola ${i.name},\n\n¡Gracias por tu compra! Ya podés empezar ${i.courseName} desde tu cuenta:\n${url}\n\nImporte abonado: ${formatPrice(i.amount)}.\nSi tenés alguna duda, respondé este mail o escribinos por WhatsApp.\n\nSi te arrepentís de tu compra, tenés 10 días corridos para pedirlo en ${arrepentimiento}\n\n${contactText}`,
  };
}

export function withdrawalReceivedEmail(i: { name: string; code: string; courses: string[] }): Built {
  const list = i.courses.join(", ");
  return {
    subject: `Recibimos tu solicitud de arrepentimiento (${i.code})`,
    html: layout(
      p(`Hola ${esc(i.name)},`) +
        p("Recibimos tu solicitud de arrepentimiento.") +
        `<p style="margin:0 0 14px;padding:14px 18px;background:#f0dbff;border-radius:10px;font-family:'Courier New',monospace;font-size:20px;font-weight:bold;letter-spacing:.08em;color:#2c0051;text-align:center">${esc(i.code)}</p>` +
        p(`Este es tu código de identificación. Curso/s: <strong>${esc(list)}</strong>.`) +
        p("Vamos a procesar tu solicitud y te avisaremos por este mismo medio sobre el reintegro. Si tenés dudas, respondé este mail."),
      contactHtml,
    ),
    text: `Hola ${i.name},\n\nRecibimos tu solicitud de arrepentimiento.\n\nTu código de identificación: ${i.code}\nCurso/s: ${list}\n\nVamos a procesar tu solicitud y te avisaremos por este mismo medio sobre el reintegro. Si tenés dudas, respondé este mail.\n\n${contactText}`,
  };
}

export function withdrawalNoticeEmail(i: { code: string; fullName: string; email: string; courses: string[]; reference: string | null; reason: string | null }): Built {
  const list = i.courses.join(", ");
  const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#4b454d">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`;
  return {
    subject: `Nueva solicitud de arrepentimiento ${i.code}`,
    html: layout(
      p("Llegó una solicitud de arrepentimiento desde la web.") +
        `<table style="font-size:14px;border-collapse:collapse;margin-bottom:14px">${row("Código", i.code)}${row("Nombre", i.fullName)}${row("Email", i.email)}${row("Curso/s", list)}${row("N.º de compra", i.reference ?? "—")}${row("Comentarios", i.reason ?? "—")}</table>` +
        p("La persona ya recibió su código por mail. Para reintegrar, hacelo desde el panel de Mercado Pago: cuando el pago figure como reembolsado, la web desactiva el acceso al curso automáticamente."),
      contactHtml,
    ),
    text: `Llegó una solicitud de arrepentimiento desde la web.\n\nCódigo: ${i.code}\nNombre: ${i.fullName}\nEmail: ${i.email}\nCurso/s: ${list}\nN.º de compra: ${i.reference ?? "—"}\nComentarios: ${i.reason ?? "—"}\n\nLa persona ya recibió su código por mail. Para reintegrar, hacelo desde el panel de Mercado Pago: cuando el pago figure como reembolsado, la web desactiva el acceso al curso automáticamente.`,
  };
}

export function paymentMismatchEmail(i: { paymentId: string; orderId: string; expected: number; received: number; currency: string }): Built {
  const txt = `Pago ${i.paymentId} (orden ${i.orderId}): se esperaban ${i.expected} ${i.currency} y llegaron ${i.received} ${i.currency}.`;
  return {
    subject: "Revisar: un pago no coincide con la orden",
    html: layout(
      p("<strong>Un pago no coincide con lo esperado y no se habilitó ningún curso.</strong>") + p(esc(txt)) + p("Revisalo en el panel de Mercado Pago y en la tabla <em>payments</em> de Supabase."),
      contactHtml,
    ),
    text: `Un pago no coincide con lo esperado y no se habilitó ningún curso.\n\n${txt}\n\nRevisalo en el panel de Mercado Pago y en la tabla payments de Supabase.`,
  };
}
