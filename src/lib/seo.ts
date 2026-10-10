type Env = Record<string, string | undefined>;

// Dirección pública del sitio, sin barra final. Si no se cargó la variable, usa la de Vercel o, en la compu, localhost.
export const siteUrl = (env: Env = process.env) =>
  (env.NEXT_PUBLIC_SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");

// Los buscadores solo entran si se pide expresamente (ALLOW_INDEXING=true).
// Los despliegues de prueba de Vercel (preview) NUNCA se indexan, aunque la variable esté prendida.
export const indexingAllowed = (env: Env = process.env) => env.ALLOW_INDEXING === "true" && env.VERCEL_ENV !== "preview";

export const robotsMeta = (env: Env = process.env) => (indexingAllowed(env) ? { index: true, follow: true } : { index: false, follow: false });

export const PUBLIC_PATHS = ["/", "/terminos", "/privacidad", "/devoluciones", "/arrepentimiento"];
// Páginas privadas o sin valor para buscadores. Cada una además lleva su propio "noindex".
export const PRIVATE_PATHS = ["/api/", "/auth/", "/ingresar", "/registro", "/recuperar", "/actualizar-contrasena", "/mis-cursos", "/compra/"];
