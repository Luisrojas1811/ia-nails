import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/payments/repo", () => ({ createAdminClient: vi.fn() }));

import { createAdminClient } from "@/lib/payments/repo";
import { requestWithdrawal } from "./actions";

const insert = vi.fn();
const form = (data: Record<string, string | string[]>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => (Array.isArray(v) ? v.forEach((x) => fd.append(k, x)) : fd.set(k, v)));
  return fd;
};
const valid = { first_name: "Camila", last_name: "Navarro", email: "camila@mail.com", courses: ["capping-polygel"] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(createAdminClient).mockReturnValue({ from: () => ({ insert }) } as never);
  insert.mockResolvedValue({ error: null });
});

describe("requestWithdrawal", () => {
  it.each([
    ["sin nombre", { ...valid, first_name: "" }],
    ["sin apellido", { ...valid, last_name: "" }],
    ["email inválido", { ...valid, email: "nada" }],
    ["sin elegir curso", { ...valid, courses: [] }],
    ["curso que no existe", { ...valid, courses: ["curso-inventado"] }],
    ["comentario de más de 1.000 caracteres", { ...valid, reason: "a".repeat(1001) }],
  ])("rechaza %s sin tocar la base", async (_, data) => {
    expect((await requestWithdrawal({}, form(data))).error).toBeTruthy();
    expect(insert).not.toHaveBeenCalled();
  });

  it("el motivo es opcional: registra sin él y devuelve el código al instante", async () => {
    const result = await requestWithdrawal({}, form(valid));
    expect(result.code).toMatch(/^ARR-\d{8}-[A-Z2-9]{6}$/);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      full_name: "Camila Navarro", email: "camila@mail.com", reason: null, reference: null, course_slugs: ["capping-polygel"],
    }));
  });

  it("acepta varios cursos y el número de compra", async () => {
    await requestWithdrawal({}, form({ ...valid, courses: ["capping-polygel", "nail-art-inicial"], order_ref: "A-123", reason: "Cambié de idea" }));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ reference: "A-123", reason: "Cambié de idea", course_slugs: ["capping-polygel", "nail-art-inicial"] }));
  });

  it("devuelve lo escrito cuando hay un error, para no perder el formulario", async () => {
    const result = await requestWithdrawal({}, form({ ...valid, courses: [], reason: "mi comentario" }));
    expect(result.values).toMatchObject({ first_name: "Camila", reason: "mi comentario" });
  });

  it("los bots (campo oculto completo) reciben un código falso y no se guarda nada", async () => {
    const result = await requestWithdrawal({}, form({ ...valid, website: "http://spam.com" }));
    expect(result.code).toBeTruthy();
    expect(insert).not.toHaveBeenCalled();
  });

  it("reintenta con otro código si el primero estaba repetido", async () => {
    insert.mockResolvedValueOnce({ error: { code: "23505", message: "dup" } });
    expect((await requestWithdrawal({}, form(valid))).code).toBeTruthy();
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it("si la base falla, avisa con un mensaje amable y sin detalles internos", async () => {
    insert.mockResolvedValue({ error: { code: "XX000", message: "connection refused 10.0.0.5" } });
    const result = await requestWithdrawal({}, form(valid));
    expect(result.error).toMatch(/WhatsApp/);
    expect(result.error).not.toMatch(/10\.0\.0\.5/);
  });

  it("si faltan las claves del servidor, también degrada con gracia", async () => {
    vi.mocked(createAdminClient).mockImplementation(() => { throw new Error("Faltan claves"); });
    expect((await requestWithdrawal({}, form(valid))).error).toBeTruthy();
  });
});
