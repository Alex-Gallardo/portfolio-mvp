// src/lib/og.tsx
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOgImage(opts: { title: string; label: string; brand: string }) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "linear-gradient(135deg, #0a0a0f 0%, #14141c 100%)",
        color: "#f4f4f8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex" }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#00d4b8",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {opts.label}
        </span>
      </div>
      <div
        style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040 }}
      >
        {opts.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 30, color: "#9b9bab" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#4f6bff",
            marginRight: 16,
            display: "flex",
          }}
        />
        {opts.brand}
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
