import { ImageResponse } from "next/og";

export const alt = "MyLoginn Tech Private Limited: software, AI, marketing and career learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 92px",
          color: "#0b1220",
          background: "radial-gradient(circle at 82% 28%, #d9f6ff 0, transparent 34%), radial-gradient(circle at 66% 82%, #eadfff 0, transparent 38%), #f8fbff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#1f56d6", fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "white", background: "linear-gradient(135deg, #1f56d6, #06b6d4)", fontSize: 34 }}>M</div>
          MYLOGINN
        </div>
        <div style={{ marginTop: 38, maxWidth: 980, fontSize: 68, lineHeight: 1.08, fontWeight: 700, letterSpacing: -2 }}>
          Build smarter. Grow faster. Learn what&apos;s next.
        </div>
        <div style={{ marginTop: 28, maxWidth: 900, color: "#576179", fontSize: 28, lineHeight: 1.4 }}>
          Software development, AI, digital marketing, technology courses and career support.
        </div>
        <div style={{ marginTop: 48, color: "#1f56d6", fontSize: 20, fontWeight: 600 }}>myloginn.com</div>
      </div>
    ),
    { ...size },
  );
}
