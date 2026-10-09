"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext, type AuthState } from "@/lib/auth";

const NO_DISPONIBLE = "El acceso a cuentas todavía no está disponible. Probá de nuevo más tarde.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const raw = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const validPassword = (p: string) => p.length >= 8 && p.length <= 72;
const SERVICIO_CAIDO = "No pudimos conectar con el servidor. Probá de nuevo en unos minutos.";
// Supabase caído o en pausa: no es culpa de la persona, no hay que decirle que se equivocó.
const isServiceError = (e: { name?: string; status?: number }) =>
  e.name === "AuthRetryableFetchError" || (typeof e.status === "number" && (e.status === 0 || e.status >= 500));

export async function signIn(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email");
  const password = raw(fd, "password");
  const fail = (error: string): AuthState => ({ error, values: { email } });
  if (!EMAIL_RE.test(email) || !password) return fail("Ingresá tu email y tu contraseña.");
  const supabase = await createClient();
  if (!supabase) return fail(NO_DISPONIBLE);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (isServiceError(error)) return fail(SERVICIO_CAIDO);
    return fail(error.code === "email_not_confirmed"
      ? "Todavía no confirmaste tu email. Revisá tu bandeja de entrada."
      : "Email o contraseña incorrectos.");
  }
  redirect(safeNext(fd.get("next")));
}

export async function signUp(_: AuthState, fd: FormData): Promise<AuthState> {
  const name = text(fd, "name");
  const email = text(fd, "email");
  const password = raw(fd, "password");
  const fail = (error: string): AuthState => ({ error, values: { name, email } });
  if (name.length < 2) return fail("Ingresá tu nombre.");
  if (!EMAIL_RE.test(email)) return fail("Ingresá un email válido.");
  if (!validPassword(password)) return fail("La contraseña debe tener entre 8 y 72 caracteres.");
  const supabase = await createClient();
  if (!supabase) return fail(NO_DISPONIBLE);
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
  if (error) {
    return fail(isServiceError(error) ? SERVICIO_CAIDO : "No pudimos crear la cuenta. Revisá los datos e intentá de nuevo.");
  }
  return { message: "Listo. Te enviamos un mail para confirmar tu cuenta." };
}

export async function requestReset(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email");
  if (!EMAIL_RE.test(email)) return { error: "Ingresá un email válido.", values: { email } };
  const supabase = await createClient();
  if (!supabase) return { error: NO_DISPONIBLE, values: { email } };
  await supabase.auth.resetPasswordForEmail(email); // misma respuesta exista o no la cuenta
  return { message: "Si el email tiene una cuenta, te enviamos un link para cambiar la contraseña." };
}

export async function updatePassword(_: AuthState, fd: FormData): Promise<AuthState> {
  const password = raw(fd, "password");
  if (!validPassword(password)) return { error: "La contraseña debe tener entre 8 y 72 caracteres." };
  if (password !== raw(fd, "confirm")) return { error: "Las contraseñas no coinciden." };
  const supabase = await createClient();
  if (!supabase) return { error: NO_DISPONIBLE };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos cambiar la contraseña. Pedí un link nuevo." };
  redirect("/mis-cursos");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
