"use client";

import type { TemplateProps } from "@/types/certificate";
import { formatCertificateDate } from "@/lib/certificate/config";
import { fonts } from "./fonts";
import { Center, FitText, Logo, Page, SampleMark, SignatureBlock, abs, useSvgId } from "./parts";

const NAVY = "#1d3a7a";
const FRAME = "#93b0e6";
const TEXT = "#1f2937";

/** Angled bars in the top-right corner; the bottom-left set is the same group rotated 180°. */
function Bands({ id, transform }: { id: (n: string) => string; transform?: string }) {
  return (
    <g transform={transform} clipPath={`url(#${id("clip")})`}>
      <polygon points="700,12 1111,12 1111,184" fill="#526aa9" />
      <g transform="rotate(22.5 900 90)">
        <rect x={790} y={6} width={330} height={26} fill={`url(#${id("bar")})`} />
        <rect x={830} y={52} width={300} height={34} fill={`url(#${id("bar")})`} />
        <rect x={760} y={104} width={150} height={20} fill={`url(#${id("barSoft")})`} />
        <rect x={960} y={112} width={200} height={16} fill={`url(#${id("barSoft")})`} />
      </g>
      {[0, 1, 2].map((i) => <line key={i} x1={640 + i * 40} y1={40 + i * 28} x2={760 + i * 40} y2={92 + i * 28} stroke="#c9e6f7" strokeWidth={2} />)}
    </g>
  );
}

/** Scalloped metallic medal. Gradients stand in for Canva's brushed-steel finish. */
function Seal({ id, cx, cy, r }: { id: (n: string) => string; cx: number; cy: number; r: number }) {
  const lobes = 16;
  let d = "";
  for (let i = 0; i <= lobes * 2; i++) {
    const a = (Math.PI * i) / lobes - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.9;
    d += `${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
  }
  return (
    <g>
      <path d={`${d}Z`} fill={`url(#${id("steel")})`} stroke="#6f86c6" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r * 0.74} fill={`url(#${id("disc")})`} stroke="#e7eeff" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke="#5068ad" strokeWidth={1} opacity={0.7} />
    </g>
  );
}

/** Modern Executive: clean frame, high-contrast serif, metallic seal and angled accents (Canva "Blue Modern Achievement"). */
export function TemplateModern({ data }: TemplateProps) {
  const id = useSvgId();
  const [left, right] = data.signatories;
  return (
    <Page background="#ffffff" color={TEXT}>
      <svg aria-hidden width={1123} height={794} viewBox="0 0 1123 794" style={abs(0, 0)}>
        <defs>
          <clipPath id={id("clip")}><rect x={0} y={12} width={1111} height={782} /></clipPath>
          <linearGradient id={id("bar")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f5ba3" /><stop offset="0.55" stopColor="#7fa3dc" /><stop offset="1" stopColor="#d6eefc" />
          </linearGradient>
          <linearGradient id={id("barSoft")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0} /><stop offset="1" stopColor="#bfe3fb" />
          </linearGradient>
          <linearGradient id={id("steel")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9d4f7" /><stop offset="0.35" stopColor="#7186c9" /><stop offset="0.6" stopColor="#dfe6ff" /><stop offset="1" stopColor="#4c62a8" />
          </linearGradient>
          <radialGradient id={id("disc")} cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#e8eeff" /><stop offset="0.45" stopColor="#8fa3df" /><stop offset="1" stopColor="#4a5fa6" />
          </radialGradient>
        </defs>

        <Bands id={id} />
        <Bands id={id} transform="rotate(180 561.5 397)" />

        <rect x={68} y={45} width={987} height={682} fill="none" stroke={FRAME} strokeWidth={5} />
        <g fill="none" stroke={FRAME} strokeWidth={5}>
          <rect x={62} y={39} width={58} height={48} /><rect x={62} y={39} width={30} height={26} />
          <rect x={1003} y={685} width={58} height={48} /><rect x={1031} y={707} width={30} height={26} />
        </g>
        <path d="M 446 190 C 486 178, 520 200, 561 186 C 602 200, 636 178, 676 190 M 486 192 C 520 206, 544 196, 561 186 C 578 196, 602 206, 636 192 M 541 182 L 561 172 L 581 182" fill="none" stroke="#9fb5e8" strokeWidth={2} strokeLinecap="round" />

        <Seal id={id} cx={561} cy={566} r={86} />
      </svg>

      <Center top={84}>
        <FitText width={860} maxSize={64} minSize={44} style={{ fontFamily: fonts.playfair, fontWeight: 800, color: NAVY, lineHeight: "84px", height: 84 }}>Certificate of Completion</FitText>
      </Center>
      <Center top={224}><div style={{ fontFamily: fonts.montserrat, fontWeight: 500, fontSize: 18, letterSpacing: 3.2 }}>THIS CERTIFICATE IS PROUDLY PRESENTED TO :</div></Center>
      <Center top={262}>
        <FitText width={700} maxSize={84} minSize={40} style={{ fontFamily: fonts.alexBrush, color: NAVY, lineHeight: "116px", height: 116 }}>{data.candidateName}</FitText>
      </Center>
      <div style={{ ...abs(211, 384), width: 701, height: 2, background: NAVY }} />
      <Center top={400}>
        <FitText width={720} maxSize={16.5} minSize={13} maxHeight={56} fitKey={data.courseTitle} style={{ fontFamily: fonts.montserrat, lineHeight: 1.65 }}>
          <>For successfully completing <b style={{ color: NAVY }}>{data.courseTitle}</b> and passing its final assessment. Completed on <b>{formatCertificateDate(data.completionDate)}</b>.</>
        </FitText>
      </Center>

      {/* Seal face: logo + verified mark */}
      <div style={{ ...abs(497, 512), width: 128, display: "flex", flexDirection: "column", alignItems: "center", color: "#ffffff" }}>
        <Logo size={46} style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }} />
        <div style={{ fontFamily: fonts.montserrat, fontWeight: 700, fontSize: 10.5, letterSpacing: 2.2, marginTop: 4, textShadow: "0 1px 1px rgba(20,30,70,0.5)" }}>VERIFIED</div>
        <div style={{ fontFamily: fonts.montserrat, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textShadow: "0 1px 1px rgba(20,30,70,0.5)" }}>{new Date(data.completionDate).getUTCFullYear()}</div>
      </div>

      <div style={abs(170, 486)}>
        <SignatureBlock signatory={left} ink="#7f9ad8" rule="#9fb5e8" nameColor={TEXT} titleColor="#4b5563" nameFont={fonts.montserrat} titleFont={fonts.montserrat} width={240} />
      </div>
      <div style={abs(713, 486)}>
        <SignatureBlock signatory={right} ink="#7f9ad8" rule="#9fb5e8" nameColor={TEXT} titleColor="#4b5563" nameFont={fonts.montserrat} titleFont={fonts.montserrat} width={240} />
      </div>
      <Center top={662}><div style={{ fontFamily: fonts.montserrat, fontSize: 11.5, letterSpacing: 1.4, color: "#4b5563" }}>CREDENTIAL ID · <b style={{ color: NAVY }}>{data.credentialId}</b></div></Center>
      <SampleMark show={data.sample} />
    </Page>
  );
}
