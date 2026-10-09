import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./config";

export async function createClient() {
  const env = supabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component: lo refresca el proxy */ }
      },
    },
  });
}

export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null; // Supabase no responde: se trata como "sin sesión" en vez de romper la página
  }
}
