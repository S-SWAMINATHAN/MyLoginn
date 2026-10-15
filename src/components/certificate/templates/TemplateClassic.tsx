"use client";

import type { TemplateProps } from "@/types/certificate";
import { formatCertificateDate } from "@/lib/certificate/config";
import { fonts } from "./fonts";
import { Center, FitText, Logo, Page, SampleMark, SignatureBlock, abs, starPath, useSvgId } from "./parts";

const INK = "#4a3f35";
const GOLD = "#c39a45";
const GOLD_LINE = "#d4ad5c";

/** One laurel branch: leaf pairs along an arc around (cx, cy). The right branch is the left one mirrored. */
const LEAF = "M0 0 C 6 -5.5, 15 -5.5, 21 0 C 15 5.5, 6 5.5, 0 0 Z"; // almond leaf pointing along +x

function Laurel({ cx, cy, r, fill, mirror }: { cx: number; cy: number; r: number; fill: string; mirror?: boolean }) {
  const from = 98, to = 222; // degrees, y-down: from just below the ring, up its left side
  const pt = (deg: number) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r] as const;
  const [sx, sy] = pt(from), [ex, ey] = pt(to);
  const leaves = Array.from({ length: 8 }, (_, i) => {
    const deg = from + 6 + i * 15.5;
    const [x, y] = pt(deg);
    const growth = deg + 90; // tangent, pointing the way the branch grows
    return (
      <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
        <path d={LEAF} transform={`rotate(${growth - 38})`} fill={fill} />
        <path d={LEAF} transform={`rotate(${growth + 38})`} fill={fill} opacity={0.85} />
      </g>
    );
  });
  return (
    <g transform={mirror ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>
      <path d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`} fill="none" stroke={fill} strokeWidth={2} />
      {leaves}
    </g>
  );
}

/** Classic Heritage: white paper, gold laurel seal and gold foil ribbons (Canva "Gold White Elegant Business"). */
export function TemplateClassic({ data }: TemplateProps) {
  const id = useSvgId();
  const [left, right] = data.signatories;
  return (
    <Page background="#ffffff" color={INK}>
      <svg aria-hidden width={1123} height={794} viewBox="0 0 1123 794" style={abs(0, 0)}>
        <defs>
          <linearGradient id={id("a")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff4cf" /><stop offset="0.45" stopColor="#e9c46f" /><stop offset="1" stopColor="#b9862c" />
          </linearGradient>
          <linearGradient id={id("b")} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a87722" /><stop offset="0.5" stopColor="#f3d68b" /><stop offset="1" stopColor="#c99a3e" />
          </linearGradient>
          <linearGradient id={id("wave")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d9b25c" /><stop offset="0.35" stopColor="#f7e2a4" /><stop offset="0.7" stopColor="#c8973b" /><stop offset="1" stopColor="#f1d38a" />
          </linearGradient>
          <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f7dd94" /><stop offset="0.5" stopColor="#b98426" /><stop offset="1" stopColor="#f0cf7c" />
          </linearGradient>
          <linearGradient id={id("leaf")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d58a" /><stop offset="1" stopColor="#b88a2e" />
          </linearGradient>
        </defs>

        {/* Gold foil sheets, top right */}
        <path d="M 735 0 C 880 36, 1010 130, 1123 318 L 1123 0 Z" fill={`url(#${id("a")})`} opacity={0.85} />
        <path d="M 850 0 C 955 52, 1050 140, 1123 232 L 1123 0 Z" fill={`url(#${id("b")})`} />
        <path d="M 975 0 C 1035 34, 1088 82, 1123 128 L 1123 0 Z" fill="#fff3c9" opacity={0.55} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={900 + i * 55} y1={0} x2={1123} y2={190 - i * 45} stroke="#ffffff" strokeWidth={1} opacity={0.4} />)}

        {/* Gold waves, bottom */}
        <path d="M 0 694 C 230 646, 450 764, 730 776 C 890 783, 1010 768, 1123 742 L 1123 794 L 0 794 Z" fill={`url(#${id("wave")})`} />
        <path d="M 0 742 C 260 704, 520 790, 1123 776 L 1123 794 L 0 794 Z" fill="#fbecc0" opacity={0.75} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M 0 ${666 + i * 5} C 240 ${622 + i * 5}, 470 ${742 + i * 3}, 780 ${776 + i * 1.5}`} fill="none" stroke="#e2c27a" strokeWidth={0.8} opacity={0.55} />
        ))}

        {/* Laurel wreath, ring and stars, top left */}
        <Laurel cx={135} cy={128} r={74} fill={`url(#${id("leaf")})`} />
        <Laurel cx={135} cy={128} r={74} fill={`url(#${id("leaf")})`} mirror />
        <circle cx={135} cy={128} r={58} fill="#ffffff" stroke={`url(#${id("ring")})`} strokeWidth={8} />
        <circle cx={135} cy={128} r={49} fill="none" stroke="#e8cf8e" strokeWidth={1} />
        {[-2, -1, 0, 1, 2].map((k) => {
          const a = ((-90 + k * 16) * Math.PI) / 180;
          return <path key={k} d={starPath(135 + Math.cos(a) * 86, 128 + Math.sin(a) * 86, k === 0 ? 9 : 7)} fill={`url(#${id("ring")})`} />;
        })}
      </svg>

      <Center top={78}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={26} />
          <span style={{ fontFamily: fonts.baskerville, fontWeight: 700, fontSize: 13.5, letterSpacing: 2.5 }}>MYLOGINN LEARNING</span>
        </div>
      </Center>
      <Center top={120}><div style={{ fontFamily: fonts.playfair, fontWeight: 600, fontSize: 76, lineHeight: 1, letterSpacing: 7 }}>CERTIFICATE</div></Center>
      <Center top={202}><div style={{ fontFamily: fonts.playfair, fontWeight: 500, fontSize: 33, lineHeight: 1, letterSpacing: 4.5 }}>OF COMPLETION</div></Center>
      <Center top={282}><div style={{ fontFamily: fonts.baskerville, fontWeight: 700, fontSize: 16.5, letterSpacing: 2.6 }}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</div></Center>
      <Center top={318}>
        <FitText width={680} maxSize={78} minSize={38} style={{ fontFamily: fonts.greatVibes, color: GOLD, lineHeight: "104px", height: 104 }}>{data.candidateName}</FitText>
      </Center>
      <div style={{ ...abs(318, 426), width: 487, height: 2.5, background: GOLD_LINE }} />
      <Center top={448}>
        <FitText width={860} maxSize={19} minSize={14.5} maxHeight={66} fitKey={data.courseTitle} style={{ fontFamily: fonts.baskerville, lineHeight: 1.65 }}>
          <>For successfully completing <b>{data.courseTitle}</b> and passing its final assessment on {formatCertificateDate(data.completionDate)}.</>
        </FitText>
      </Center>
      <Center top={514}><div style={{ fontFamily: fonts.baskerville, fontSize: 12.5, letterSpacing: 1.2, color: "#7b6d5d" }}>Credential ID: {data.credentialId}</div></Center>

      <div style={abs(212, 540)}>
        <SignatureBlock signatory={left} ink="#1f1a14" rule="#8a7a63" nameColor={INK} titleColor="#5d5146" nameFont={fonts.baskerville} titleFont={fonts.baskerville} nameUppercase width={240} />
      </div>
      <div style={abs(671, 540)}>
        <SignatureBlock signatory={right} ink="#1f1a14" rule="#8a7a63" nameColor={INK} titleColor="#5d5146" nameFont={fonts.baskerville} titleFont={fonts.baskerville} nameUppercase width={240} />
      </div>
      <SampleMark show={data.sample} />
    </Page>
  );
}
