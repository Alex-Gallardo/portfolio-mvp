// src/lib/og.tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_DIR = join(process.cwd(), "src", "lib", "og-fonts");

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, "Sora-Regular.ttf")),
    readFile(join(FONT_DIR, "Sora-Bold.ttf")),
  ]);
  return [
    { name: "Sora", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Sora", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

type OgInput = {
  title: string;
  label: string;
  brand: string;
  /** Texto de métrica opcional, ej. "1.240 descargas" o "5 min de lectura". */
  metric?: string;
  /** Color de acento del label. Por defecto turquesa de marca. */
  accent?: string;
};

export async function renderOgImage(opts: OgInput) {
  const fonts = await loadFonts();
  const accent = opts.accent ?? "#00d4b8";

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#0a0a0f",
        color: "#f4f4f8",
        fontFamily: "Sora",
        overflow: "hidden",
      }}
    >
      {/* Aurora glow 1 (acento) */}
      <div
        style={{
          position: "absolute",
          top: -220,
          left: -160,
          width: 620,
          height: 620,
          borderRadius: 9999,
          background: accent,
          opacity: 0.22,
          filter: "blur(120px)",
          display: "flex",
        }}
      />
      {/* Aurora glow 2 (índigo de marca) */}
      <div
        style={{
          position: "absolute",
          bottom: -260,
          right: -180,
          width: 680,
          height: 680,
          borderRadius: 9999,
          background: "#4f6bff",
          opacity: 0.28,
          filter: "blur(130px)",
          display: "flex",
        }}
      />

      {/* Top: label tipo "pill" */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 22px",
            borderRadius: 9999,
            border: `1px solid ${accent}`,
            background: "rgba(255,255,255,0.04)",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {opts.label}
        </div>
      </div>

      {/* Centro: título */}
      <div
        style={{
          display: "flex",
          fontSize: opts.title.length > 60 ? 60 : 74,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: -1,
          maxWidth: 1000,
        }}
      >
        {opts.title}
      </div>

      {/* Bottom: marca + métrica */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", color: "#f4f4f8", fontWeight: 700 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: accent,
              marginRight: 16,
              display: "flex",
            }}
          />
          {opts.brand}
        </div>
        {opts.metric ? (
          <div style={{ display: "flex", color: "#9b9bab", fontWeight: 400 }}>{opts.metric}</div>
        ) : null}
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
