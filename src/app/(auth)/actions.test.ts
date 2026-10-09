import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }),
}));

import { createClient } from "@/lib/supabase/server";
import { requestReset, signIn, signUp, updatePassword } from "./actions";

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
};
const form = (data: Record<string, string>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.set(k, v));
  return fd;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({ auth } as never);
  auth.signUp.mockResolvedValue({ error: null });
  auth.signInWithPassword.mockResolvedValue({ error: null });
  auth.resetPasswordForEmail.mockResolvedValue({ error: null });
  auth.updateUser.mockResolvedValue({ error: null });
});

describe("signUp", () => {
  const valid = { name: "Camila Navarro", email: "camila@mail.com", password: "clave-segura-1" };

  it.each([
    ["nombre muy corto", { ...valid, name: "C" }],
    ["email inválido", { ...valid, email: "camila@" }],
    ["contraseña corta", { ...valid, password: "1234567" }],
    ["contraseña demasiado larga", { ...valid, password: "a".repeat(73) }],
  ])("rechaza %s sin llamar a Supabase", async (_, data) => {
    const result = await signUp({}, form(data));
    expect(result.error).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("crea la cuenta guardando el nombre", async () => {
    const result = await signUp({}, form(valid));
    expect(result.message).toMatch(/confirmar/i);
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "camila@mail.com",
      password: "clave-segura-1",
      options: { data: { full_name: "Camila Navarro" } },
    });
  });

  it("no filtra el motivo real del error de Supabase", async () => {
    auth.signUp.mockResolvedValue({ error: { message: "User already registered" } });
    const result = await signUp({}, form(valid));
    expect(result.error).not.toMatch(/already/i);
  });

  it("avisa si las cuentas todavía no están configuradas", async () => {
    vi.mocked(createClient).mockResolvedValue(null);
    expect((await signUp({}, form(valid))).error).toMatch(/todavía no está disponible/);
  });
});

describe("signIn", () => {
  const creds = { email: "camila@mail.com", password: "clave-segura-1" };

  it("pide email y contraseña", async () => {
    expect((await signIn({}, form({ email: "", password: "" }))).error).toBeTruthy();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("da un mensaje genérico ante credenciales incorrectas", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    expect((await signIn({}, form(creds))).error).toBe("Email o contraseña incorrectos.");
  });

  it("avisa si falta confirmar el email", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: "email_not_confirmed" } });
    expect((await signIn({}, form(creds))).error).toMatch(/confirmaste tu email/);
  });

  it("redirige al destino pedido si es interno", async () => {
    await expect(signIn({}, form({ ...creds, next: "/cursos/capping-polygel" }))).rejects.toThrow("REDIRECT:/cursos/capping-polygel");
  });

  it("ignora destinos externos", async () => {
    await expect(signIn({}, form({ ...creds, next: "//evil.com" }))).rejects.toThrow("REDIRECT:/mis-cursos");
  });
});

describe("requestReset", () => {
  it("valida el email", async () => {
    expect((await requestReset({}, form({ email: "nada" }))).error).toBeTruthy();
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("responde igual aunque Supabase falle (no revela si existe la cuenta)", async () => {
    const ok = await requestReset({}, form({ email: "a@b.com" }));
    auth.resetPasswordForEmail.mockResolvedValue({ error: { message: "user not found" } });
    const fail = await requestReset({}, form({ email: "a@b.com" }));
    expect(fail).toEqual(ok);
  });
});

describe("updatePassword", () => {
  it("exige contraseña válida y que coincidan", async () => {
    expect((await updatePassword({}, form({ password: "corta", confirm: "corta" }))).error).toBeTruthy();
    expect((await updatePassword({}, form({ password: "clave-larga-1", confirm: "otra-clave-1" }))).error).toMatch(/no coinciden/);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("cambia la contraseña y redirige", async () => {
    await expect(updatePassword({}, form({ password: "clave-larga-1", confirm: "clave-larga-1" }))).rejects.toThrow("REDIRECT:/mis-cursos");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "clave-larga-1" });
  });
});

describe("los errores devuelven lo escrito (nunca la contraseña)", () => {
  it("ingreso: conserva el email si la contraseña es incorrecta", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    const r = await signIn({}, form({ email: "camila@mail.com", password: "equivocada-1" }));
    expect(r.error).toBeTruthy();
    expect(r.values).toEqual({ email: "camila@mail.com" });
    expect(JSON.stringify(r)).not.toContain("equivocada-1");
  });

  it("registro: conserva nombre y email, pero no la contraseña", async () => {
    const r = await signUp({}, form({ name: "Camila Navarro", email: "camila@mail.com", password: "corta" }));
    expect(r.error).toBeTruthy();
    expect(r.values).toEqual({ name: "Camila Navarro", email: "camila@mail.com" });
    expect(JSON.stringify(r)).not.toContain("corta");
  });

  it("recuperar contraseña: conserva el email inválido para que lo corrija", async () => {
    const r = await requestReset({}, form({ email: "camila@" }));
    expect(r.values).toEqual({ email: "camila@" });
  });
});

describe("cuando Supabase no responde (caído o en pausa)", () => {
  const down = { name: "AuthRetryableFetchError", status: 0, message: "fetch failed" };

  it("ingreso: avisa del problema del servidor y NO dice que la contraseña es incorrecta", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: down });
    const r = await signIn({}, form({ email: "camila@mail.com", password: "clave-segura-1" }));
    expect(r.error).toMatch(/conectar con el servidor/);
    expect(r.error).not.toMatch(/incorrectos/);
    expect(r.values).toEqual({ email: "camila@mail.com" });
  });

  it("ingreso: un error 500 también cuenta como servidor caído", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 503 } });
    expect((await signIn({}, form({ email: "a@b.com", password: "x" }))).error).toMatch(/conectar con el servidor/);
  });

  it("registro: avisa del servidor y no culpa a los datos", async () => {
    auth.signUp.mockResolvedValue({ error: down });
    const r = await signUp({}, form({ name: "Camila Navarro", email: "camila@mail.com", password: "clave-segura-1" }));
    expect(r.error).toMatch(/conectar con el servidor/);
  });
});
