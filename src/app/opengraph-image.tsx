import { ImageResponse } from "next/og";

export const alt = "Belvie Network model";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#FBF7F4",
          color: "#2B2622",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#BA5D42",
            fontWeight: 700,
          }}
        >
          Belvie · Bengaluru
        </div>
        <div style={{ fontSize: 64, marginTop: 12, fontFamily: "Georgia, serif" }}>
          Network model
        </div>
        <div style={{ fontSize: 28, marginTop: 18, color: "#6B6560" }}>
          P&L first, then the spoke network, then sensitivity.
        </div>
      </div>
    ),
    { ...size },
  );
}
