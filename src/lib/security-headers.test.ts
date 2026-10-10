import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function headers(nodeEnv: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.resetModules();
  const config = (await import("../../next.config")).default;
  const rules = await config.headers!();
  return { config, map: Object.fromEntries(rules[0].headers.map((h) => [h.key, h.value])), source: rules[0].source };
}

describe("encabezados de seguridad", () => {
  it("se aplican a todo el sitio, también en desarrollo", async () => {
    const { map, source } = await headers("development");
    expect(source).toBe("/:path*");
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["X-Frame-Options"]).toBe("DENY");
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(map["Permissions-Policy"]).toContain("camera=()");
  });

  it("no revela con qué está hecho el sitio", async () => {
    expect((await headers("production")).config.poweredByHeader).toBe(false);
  });

  it("la política de contenido solo está en producción (en desarrollo rompería la recarga en vivo)", async () => {
    const dev = (await headers("development")).map;
    expect(dev["Content-Security-Policy"] ?? dev["Content-Security-Policy-Report-Only"]).toBeUndefined();
  });

  it("en producción restringe lo importante: frames, scripts externos y objetos", async () => {
    const { map } = await headers("production");
    const csp = map["Content-Security-Policy"] ?? map["Content-Security-Policy-Report-Only"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-src https://iframe.mediadelivery.net");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/script-src[^;]*https?:/); // ningún script de otro sitio
  });
});
