import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Monograma provisorio. Reemplazar por el logo real de Iara.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#8126d1", color: "#ffffff", fontSize: 250, fontWeight: 700, letterSpacing: -8, borderRadius: 112 }}>
        IA
      </div>
    ),
    { ...size },
  );
}
