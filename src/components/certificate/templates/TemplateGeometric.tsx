"use client";

import type { TemplateProps } from "@/types/certificate";
import { formatCertificateDate } from "@/lib/certificate/config";
import { fonts } from "./fonts";
import { Center, Credential, FitText, Logo, Page, SampleMark, SignatureBlock, abs } from "./parts";

const NAVY = "#0b2766";
const CYAN = "#1aa6d1";
const TEAL = "#1b6f9b";
const SHADOW = "#c9ccd1";

/** Corner cluster of shards (top right); the bottom-left cluster is this group turned 180°. */
function Shards({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      <polygon points="900,30 919,30 1123,240 1123,264" fill={SHADOW} />
      <polygon points="919,30 1123,30 1123,240" fill={NAVY} />
      <polygon points="825,0 1123,0 1123,30 856,30" fill={CYAN} />
      <polygon points="856,56 1020,56 1064,102 900,102" fill={CYAN} />
      <polygon points="1031,240 1123,240 1123,332" fill={NAVY} />
      <polygon points="1092,254 1123,254 1123,286" fill={CYAN} />
    </g>
  );
}

const MARBLE =
  "radial-gradient(ellipse 45% 35% at 18% 28%, #ffffff 0%, rgba(255,255,255,0) 100%)," +
  "radial-gradient(ellipse 50% 40% at 78% 70%, #ffffff 0%, rgba(255,255,255,0) 100%)," +
  "radial-gradient(ellipse 35% 25% at 58% 18%, #e2e5ea 0%, rgba(226,229,234,0) 100%)," +
  "radial-gradient(ellipse 30% 30% at 35% 82%, #e4e7eb 0%, rgba(228,231,235,0) 100%)," +
  "#eef0f3";

/** Bold Geometric: marble paper with navy and cyan shards (Canva "Blue and White Modern Appreciation"). */
export function TemplateGeometric({ data }: TemplateProps) {
  const [left, right] = data.signatories;
  const wide = { fontFamily: fonts.archivo, fontStretch: "125%" } as const;
  return (
    <Page background={MARBLE} color={NAVY}>
      <svg aria-hidden width={1123} height={794} viewBox="0 0 1123 794" style={abs(0, 0)}>
        {/* faint marble veins */}
        <g fill="none" stroke="#d9dce2" strokeWidth={1}>
          <path d="M 120 220 C 300 180, 420 300, 640 250 S 900 300, 1060 380" />
          <path d="M 60 520 C 240 470, 380 600, 560 560 S 820 520, 980 610" opacity={0.7} />
          <path d="M 300 90 C 380 140, 470 110, 560 160" opacity={0.6} />
        </g>
        <Shards />
        <Shards transform="rotate(180 561.5 397)" />
        <polygon points="48,33 99,33 48,84" fill={CYAN} />
        <polygon points="0,84 48,84 0,132" fill={NAVY} />
        <polygon points="566,0 616,0 566,50" fill={NAVY} />
        <polygon points="700,0 732,0 714,28 682,28" fill={TEAL} />
        <polygon points="1075,710 1123,710 1123,758" fill={NAVY} />
        <polygon points="1020,794 1075,740 1075,794" fill={CYAN} />
        <polygon points="507,794 557,744 557,794" fill={NAVY} />
      </svg>

      <Center top={78}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={28} />
          <span style={{ ...wide, fontWeight: 700, fontSize: 13, letterSpacing: 3 }}>MYLOGINN LEARNING</span>
        </div>
      </Center>
      <Center top={124}><div style={{ ...wide, fontWeight: 800, fontSize: 94, lineHeight: 1, letterSpacing: 1 }}>CERTIFICATE</div></Center>
      <Center top={230}><div style={{ ...wide, fontWeight: 800, fontSize: 44, lineHeight: 1, color: TEAL }}>OF COMPLETION</div></Center>
      <Center top={306}><div style={{ ...wide, fontWeight: 700, fontSize: 19, letterSpacing: 0.5 }}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</div></Center>
      <Center top={338}>
        <FitText width={680} maxSize={72} minSize={36} style={{ fontFamily: fonts.pinyon, color: TEAL, lineHeight: "112px", height: 112 }}>{data.candidateName}</FitText>
      </Center>
      <Center top={460}>
        <FitText width={640} maxSize={16} minSize={13} maxHeight={78} fitKey={data.courseTitle} style={{ fontFamily: fonts.archivo, lineHeight: 1.6 }}>
          <>For successfully completing <b>{data.courseTitle}</b> and passing its final assessment, demonstrating the skills and discipline to build real-world solutions. Completed on <b>{formatCertificateDate(data.completionDate)}</b>.</>
        </FitText>
      </Center>

      <div style={abs(170, 568)}>
        <SignatureBlock signatory={left} ink={NAVY} rule={CYAN} nameColor={NAVY} titleColor="#3d4b6b" nameFont={fonts.archivo} titleFont={fonts.archivo} width={240} ruleWidth={150} />
      </div>
      <div style={abs(713, 568)}>
        <SignatureBlock signatory={right} ink={NAVY} rule={CYAN} nameColor={NAVY} titleColor="#3d4b6b" nameFont={fonts.archivo} titleFont={fonts.archivo} width={240} ruleWidth={150} />
      </div>
      <div style={abs(471, 644)}><Credential id={data.credentialId} font={fonts.archivo} labelColor="#3d4b6b" valueColor={NAVY} /></div>
      <SampleMark show={data.sample} />
    </Page>
  );
}
