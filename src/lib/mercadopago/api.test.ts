import { describe, expect, it } from "vitest";
import { pickCheckoutUrl } from "./api";

const pref = { id: "1", init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1", sandbox_init_point: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=1" };

describe("pickCheckoutUrl", () => {
  it("por defecto usa la URL normal", () => expect(pickCheckoutUrl(pref, false)).toBe(pref.init_point));
  it("con sandbox activado usa la URL de prueba", () => expect(pickCheckoutUrl(pref, true)).toBe(pref.sandbox_init_point));
  it("si no existe la URL sandbox, vuelve a la normal", () => {
    expect(pickCheckoutUrl({ id: "1", init_point: pref.init_point }, true)).toBe(pref.init_point);
  });
});
