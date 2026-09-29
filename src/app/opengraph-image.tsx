import { ImageResponse } from "next/og";

export const alt = "IA NAILS — Atelier & Academia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Versión provisoria: se rehace con el logo y una foto reales.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 96px", color: "#1a1c1d", background: "radial-gradient(circle at 88% 12%, #f0dbff 0%, #faf9fb 58%)" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 8, color: "#8126d1" }}>ATELIER &amp; ACADEMIA</div>
        <div style={{ display: "flex", fontSize: 168, fontWeight: 700, letterSpacing: -4, marginTop: 12 }}>IA NAILS</div>
        <div style={{ display: "flex", fontSize: 42, color: "#4b454d", marginTop: 8 }}>Cursos online de técnicas de uñas</div>
        <div style={{ display: "flex", fontSize: 28, color: "#4b454d", marginTop: 56 }}>Bernal, Buenos Aires</div>
      </div>
    ),
    { ...size },
  );
}
