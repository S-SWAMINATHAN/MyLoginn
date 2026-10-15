"use client";

import type { TemplateProps } from "@/types/certificate";
import { formatCertificateDate } from "@/lib/certificate/config";
import { fonts } from "./fonts";
import { Center, Credential, FitText, Logo, Page, SampleMark, SignatureBlock, abs } from "./parts";

const NAVY = "#08093f";
const CYAN = "#1fe4f2";
const MUTED = "#a9b6e0";

/** Stepped circuit "bus": the outer trace, with copies shifted toward the corner. */
function Circuit({ transform }: { transform?: string }) {
  const d = "M 10 262 L 122 262 L 196 188 L 196 112 L 320 -12";
  return (
    <g transform={transform} fill="none" stroke={CYAN} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={i === 0 ? d : d.replace("M 10", "M -60")} transform={`translate(${-i * 10.5} ${-i * 10.5})`} />
      ))}
      <circle cx={10} cy={262} r={4.5} fill={CYAN} stroke="none" />
    </g>
  );
}

type Net = { nodes: [number, number][]; edges: [number, number][] };
const TOP_RIGHT: Net = {
  nodes: [[760, 30], [915, 30], [1093, 30], [852, 60], [946, 74], [880, 176], [944, 222], [868, 284], [1000, 300], [1057, 284], [1093, 364]],
  edges: [[0, 1], [1, 2], [0, 3], [3, 1], [1, 5], [2, 5], [2, 4], [4, 1], [3, 5], [5, 6], [6, 8], [5, 7], [6, 7], [2, 9], [9, 8], [9, 10], [6, 2]],
};
const BOTTOM_LEFT: Net = {
  nodes: [[30, 400], [68, 488], [130, 470], [272, 490], [192, 562], [262, 606], [190, 720], [222, 762], [30, 762], [288, 730], [392, 762]],
  edges: [[0, 1], [1, 2], [2, 4], [4, 3], [1, 4], [4, 5], [5, 8], [5, 6], [5, 7], [6, 7], [7, 9], [5, 9], [8, 6], [8, 7], [7, 10], [4, 8]],
};

function Network({ net, transform }: { net: Net; transform?: string }) {
  return (
    <g transform={transform}>
      {net.edges.map(([a, b]) => <line key={`${a}-${b}`} x1={net.nodes[a][0]} y1={net.nodes[a][1]} x2={net.nodes[b][0]} y2={net.nodes[b][1]} stroke={CYAN} strokeWidth={1.4} />)}
      {net.nodes.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={4.2} fill={CYAN} />)}
    </g>
  );
}

/** Tech Vanguard: deep navy, cyan circuit traces and constellation networks (Canva "Modern Innovation Award"). */
export function TemplateTech({ data }: TemplateProps) {
  const [left, right] = data.signatories;
  return (
    <Page background={NAVY} color="#ffffff">
      <svg aria-hidden width={1123} height={794} viewBox="0 0 1123 794" style={abs(0, 0)}>
        <Circuit />
        <Circuit transform="rotate(180 561.5 397)" />
        <Network net={TOP_RIGHT} transform="translate(1123 0) scale(0.8) translate(-1123 0)" />
        <Network net={BOTTOM_LEFT} transform="translate(0 794) scale(0.78) translate(0 -794)" />
      </svg>

      <Center top={44}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={46} />
          <div style={{ textAlign: "left", lineHeight: 1 }}>
            <div style={{ fontFamily: fonts.poppins, fontWeight: 800, fontSize: 32, letterSpacing: 4 }}>MYLOGINN</div>
            <div style={{ fontFamily: fonts.poppins, fontWeight: 600, fontSize: 12.5, letterSpacing: 6.2, color: CYAN, marginTop: 5 }}>LEARNING</div>
          </div>
        </div>
      </Center>

      <Center top={124}><div style={{ fontFamily: fonts.poppins, fontWeight: 800, fontSize: 84, lineHeight: 1, letterSpacing: 1 }}>CERTIFICATE OF</div></Center>
      <Center top={212}><div style={{ fontFamily: fonts.poppins, fontWeight: 300, fontSize: 64, lineHeight: 1, letterSpacing: 2 }}>COMPLETION</div></Center>
      <Center top={312}><div style={{ fontFamily: fonts.poppins, fontSize: 18 }}>This certificate is proudly presented to:</div></Center>
      <Center top={346}>
        <FitText width={780} maxSize={66} minSize={30} style={{ fontFamily: fonts.poppins, fontWeight: 800, lineHeight: "84px", height: 84, textTransform: "uppercase", letterSpacing: 1 }}>{data.candidateName}</FitText>
      </Center>
      <Center top={444}>
        <FitText width={680} maxSize={18.5} minSize={14} maxHeight={84} fitKey={data.courseTitle} style={{ fontFamily: fonts.poppins, lineHeight: 1.55 }}>
          <>For successfully completing <span style={{ color: CYAN, fontWeight: 600 }}>{data.courseTitle}</span> and passing its final assessment, demonstrating practical, job-ready skill.</>
        </FitText>
      </Center>
      <Center top={536}><div style={{ fontFamily: fonts.poppins, fontWeight: 700, fontSize: 18 }}>{formatCertificateDate(data.completionDate)}</div></Center>

      <div style={abs(248, 590)}>
        <SignatureBlock signatory={left} ink="#ffffff" rule="#ffffff" nameColor="#ffffff" titleColor={MUTED} nameFont={fonts.poppins} titleFont={fonts.poppins} nameUppercase />
      </div>
      <div style={abs(645, 590)}>
        <SignatureBlock signatory={right} ink="#ffffff" rule="#ffffff" nameColor="#ffffff" titleColor={MUTED} nameFont={fonts.poppins} titleFont={fonts.poppins} nameUppercase />
      </div>
      <div style={abs(471, 668)}><Credential id={data.credentialId} font={fonts.poppins} labelColor={MUTED} valueColor={CYAN} /></div>
      <SampleMark show={data.sample} />
    </Page>
  );
}
