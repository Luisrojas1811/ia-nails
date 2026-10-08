// "values": lo que la persona escribió (nunca la contraseña), para no obligarla a cargarlo de nuevo tras un error.
export type AuthState = { error?: string; message?: string; values?: Record<string, string> };

// Solo permite redirigir a rutas internas (evita "open redirect").
export const safeNext = (value: unknown, fallback = "/mis-cursos") =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : fallback;
