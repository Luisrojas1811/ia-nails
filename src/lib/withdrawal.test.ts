import { describe, expect, it } from "vitest";
import { makeWithdrawalCode } from "./withdrawal";

describe("makeWithdrawalCode", () => {
  it("tiene el formato ARR-AAAAMMDD-XXXXXX sin caracteres ambiguos", () => {
    expect(makeWithdrawalCode(new Date("2026-10-01T12:00:00Z"))).toMatch(/^ARR-20261001-[A-HJ-NP-Z2-9]{6}$/);
  });
  it("no repite códigos en 2000 generaciones", () => {
    const codes = new Set(Array.from({ length: 2000 }, () => makeWithdrawalCode()));
    expect(codes.size).toBe(2000);
  });
});
