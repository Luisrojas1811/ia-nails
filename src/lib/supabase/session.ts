import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./config";

// Refresca la sesión en cada request de cuenta y protege /mis-cursos.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = supabaseEnv();
  let loggedIn = false;

  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    loggedIn = Boolean(data?.claims);
  }

  const { pathname, search } = request.nextUrl;
  if (!loggedIn && pathname.startsWith("/mis-cursos")) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}
