import { describe, expect, it } from "vitest";
import { esc, paymentMismatchEmail, purchaseConfirmationEmail, withdrawalNoticeEmail, withdrawalReceivedEmail } from "./templates";

const SITE = "https://ianails.com.ar";

describe("esc", () => {
  it("neutraliza HTML", () => expect(esc(`<img src=x onerror="alert('x')">&`)).toBe("&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;"));
});

describe("mail de compra", () => {
  const m = purchaseConfirmationEmail({ name: "Camila", courseName: "Capping Polygel", courseSlug: "capping-polygel", amount: 25000, siteUrl: SITE });
  it("tiene asunto, link directo al curso y el botón de arrepentimiento", () => {
    expect(m.subject).toContain("Capping Polygel");
    expect(m.html).toContain(`href="${SITE}/mis-cursos/capping-polygel"`);
    expect(m.html).toContain(`${SITE}/arrepentimiento`);
    expect(m.text).toContain(`${SITE}/mis-cursos/capping-polygel`);
    expect(m.text).toContain("arrepentís");
  });
  it("muestra el importe en pesos", () => expect(m.text.replace(/\s/g, " ")).toContain("$ 25.000"));
  it("un nombre malicioso no mete HTML", () => {
    const evil = purchaseConfirmationEmail({ name: "<script>alert(1)</script>", courseName: "Curso", courseSlug: "curso", amount: 1, siteUrl: SITE });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).toContain("&lt;script&gt;");
  });
});

describe("mails de arrepentimiento", () => {
  const person = withdrawalReceivedEmail({ name: "Camila", code: "ARR-20261010-K7M2QX", courses: ["Capping Polygel", "Nail Art inicial"] });
  it("a la persona: lleva el código y los cursos, en HTML y en texto", () => {
    expect(person.subject).toContain("ARR-20261010-K7M2QX");
    for (const body of [person.html, person.text]) {
      expect(body).toContain("ARR-20261010-K7M2QX");
      expect(body).toContain("Capping Polygel, Nail Art inicial");
    }
  });
  const notice = withdrawalNoticeEmail({ code: "ARR-1", fullName: "Camila <b>Navarro</b>", email: "c@mail.com", courses: ["X"], reference: null, reason: `"><script>1</script>` });
  it("al titular: incluye los datos y explica cómo reintegrar", () => {
    expect(notice.html).toContain("c@mail.com");
    expect(notice.text).toContain("panel de Mercado Pago");
  });
  it("al titular: lo que escribió la persona está escapado", () => {
    expect(notice.html).not.toContain("<script>");
    expect(notice.html).not.toContain("<b>Navarro</b>");
  });
});

describe("mail de pago que no coincide", () => {
  it("indica pago, orden y montos", () => {
    const m = paymentMismatchEmail({ paymentId: "555", orderId: "o-1", expected: 25000, received: 1, currency: "ARS" });
    expect(m.text).toContain("555");
    expect(m.text).toContain("25000");
    expect(m.text).toContain("no se habilitó ningún curso");
  });
});
