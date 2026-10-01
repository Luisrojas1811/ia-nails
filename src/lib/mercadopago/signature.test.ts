import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "./signature";

const secret = "secreto-de-prueba";
const sign = (manifest: string, key = secret) => createHmac("sha256", key).update(manifest).digest("hex");
const base = { dataId: "123456", xRequestId: "req-1", secret };
const header = (ts: string, v1: string) => `ts=${ts},v1=${v1}`;

describe("verifyWebhookSignature", () => {
  it("acepta una firma válida", () => {
    const v1 = sign("id:123456;request-id:req-1;ts:1700000000;");
    expect(verifyWebhookSignature({ ...base, xSignature: header("1700000000", v1) })).toBe(true);
  });

  it("pasa a minúscula los ids alfanuméricos antes de firmar", () => {
    const v1 = sign("id:abc123;request-id:req-1;ts:1;");
    expect(verifyWebhookSignature({ ...base, dataId: "ABC123", xSignature: header("1", v1) })).toBe(true);
  });

  it("omite request-id del manifest si no vino el header", () => {
    const v1 = sign("id:123456;ts:1;");
    expect(verifyWebhookSignature({ ...base, xRequestId: null, xSignature: header("1", v1) })).toBe(true);
  });

  it("rechaza si cambia el id del pago", () => {
    const v1 = sign("id:123456;request-id:req-1;ts:1;");
    expect(verifyWebhookSignature({ ...base, dataId: "999999", xSignature: header("1", v1) })).toBe(false);
  });

  it("rechaza si cambia el timestamp", () => {
    const v1 = sign("id:123456;request-id:req-1;ts:1;");
    expect(verifyWebhookSignature({ ...base, xSignature: header("2", v1) })).toBe(false);
  });

  it("rechaza si se firmó con otro secreto", () => {
    const v1 = sign("id:123456;request-id:req-1;ts:1;", "otro");
    expect(verifyWebhookSignature({ ...base, xSignature: header("1", v1) })).toBe(false);
  });

  it.each([
    ["sin header", null],
    ["header vacío", ""],
    ["sin v1", "ts=1"],
    ["sin ts", `v1=${"a".repeat(64)}`],
    ["v1 con largo incorrecto", "ts=1,v1=abc"],
    ["v1 no hexadecimal", `ts=1,v1=${"z".repeat(64)}`],
  ])("rechaza %s", (_, xSignature) => {
    expect(verifyWebhookSignature({ ...base, xSignature })).toBe(false);
  });

  it("rechaza si falta el secreto o el id", () => {
    const v1 = sign("id:123456;request-id:req-1;ts:1;");
    expect(verifyWebhookSignature({ ...base, secret: undefined, xSignature: header("1", v1) })).toBe(false);
    expect(verifyWebhookSignature({ ...base, dataId: null, xSignature: header("1", v1) })).toBe(false);
  });
});
