export type AuthState = { error?: string; message?: string };

// Solo permite redirigir a rutas internas (evita "open redirect").
export const safeNext = (value: unknown, fallback = "/mis-cursos") =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : fallback;
