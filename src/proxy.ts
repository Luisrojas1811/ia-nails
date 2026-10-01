import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Solo rutas de cuenta: las páginas públicas siguen siendo estáticas y rápidas.
export const config = {
  matcher: ["/mis-cursos/:path*", "/ingresar", "/registro", "/recuperar", "/actualizar-contrasena", "/compra/:path*"],
};
