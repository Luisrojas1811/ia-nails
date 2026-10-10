import type { NextConfig } from "next";

// Política de contenido (CSP). Está en modo "solo avisar": no bloquea nada, pero el navegador anota en la consola (F12)
// cualquier cosa que bloquearía. Cuando se navegó todo el sitio en producción sin avisos, se pasa a true.
const CSP_ENFORCE = false;

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'", // Next.js necesita scripts en línea; sin ellos no hidrata
  "connect-src 'self'", // el navegador no habla directo con Supabase: lo hace el servidor
  "frame-src https://iframe.mediadelivery.net https://player.mediadelivery.net", // videos de Bunny
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Solo en producción: en desarrollo Next necesita permisos que esta política no da.
  ...(process.env.NODE_ENV === "production"
    ? [{ key: CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: csp }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
