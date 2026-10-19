import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MyLoginn | Web, App & Digital Solutions for Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card shown when a MyLoginn link is shared (WhatsApp, LinkedIn, X, Slack...). */
export default async function OpenGraphImage() {
  const asDataUrl = async (file: string) => `data:image/png;base64,${(await readFile(join(process.cwd(), "src/images", file))).toString("base64")}`;
  const [icon, wordmark] = await Promise.all([asDataUrl("MyLoginn Logo Icon.png"), asDataUrl("MyLoginn Logo Text.png")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 92px",
          color: "#0b1f4d",
          background: "radial-gradient(circle at 84% 22%, rgba(217,246,255,1) 0%, rgba(217,246,255,0) 36%), radial-gradient(circle at 70% 88%, rgba(227,235,255,1) 0%, rgba(227,235,255,0) 40%), #f8fbff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
          <img src={icon} width={82} height={60} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wordmark} width={260} height={48} alt="" />
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 84, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2 }}>
          <span style={{ color: "#1f56d6" }}>Build.</span>&nbsp;Automate.&nbsp;<span style={{ color: "#0891b2" }}>Grow.</span>
        </div>
        <div style={{ marginTop: 28, maxWidth: 940, color: "#475569", fontSize: 30, lineHeight: 1.4 }}>
          Websites, mobile apps, desktop software, AI agents and digital marketing for businesses in India and worldwide.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
          {["Web", "App", "Desktop", "AI Agents", "Marketing"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "#eaf1ff", color: "#1f56d6", fontSize: 22, fontWeight: 600 }}>{t}</div>
          ))}
          <div style={{ display: "flex", marginLeft: "auto", alignItems: "center", color: "#1f56d6", fontSize: 24, fontWeight: 700 }}>myloginn.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
