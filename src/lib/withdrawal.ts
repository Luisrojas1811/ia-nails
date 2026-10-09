import { randomInt } from "node:crypto";
import type { AuthState } from "./auth";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusiones

// Código de identificación del arrepentimiento, p. ej. ARR-20261001-K7M2QX
export function makeWithdrawalCode(now = new Date()) {
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `ARR-${day}-${suffix}`;
}

export type WithdrawalValues = { first_name: string; last_name: string; email: string; order_ref: string; reason: string; courses: string[] };
// "values" devuelve lo que escribió la persona para no hacerle volver a cargar todo si hay un error.
export type WithdrawalState = Omit<AuthState, "values"> & { code?: string; emailed?: boolean; values?: WithdrawalValues };
