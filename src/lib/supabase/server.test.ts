import { afterEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn(() => ({ auth: { getUser } })) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));

import { getUser as getSessionUser } from "./server";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("getUser", () => {
  it("sin claves de Supabase devuelve null", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ""); vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(await getSessionUser()).toBeNull();
  });

  it("devuelve la persona con sesión", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "k");
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    expect(await getSessionUser()).toEqual({ id: "u1" });
  });

  it("si Supabase no responde (se cae o está en pausa) no rompe: devuelve null", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "k");
    getUser.mockRejectedValue(new Error("fetch failed"));
    expect(await getSessionUser()).toBeNull();
  });
});
