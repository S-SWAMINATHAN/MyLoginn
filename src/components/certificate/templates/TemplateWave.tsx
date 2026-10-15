"use client";

import type { TemplateProps } from "@/types/certificate";
import { formatCertificateDate } from "@/lib/certificate/config";
import { fonts } from "./fonts";
import { Center, Credential, FitText, Logo, Page, SampleMark, SignatureBlock, abs, useSvgId } from "./parts";

const NAVY = "#1f3a8a";
const DARK = "#23408f";
const MID = "#2d4a9d";
const SKY = "#4ea5dc";
const TEXT = "#111827";

type Curve = [number, number, number, number, number, number, number, number];
const lerp = (a: Curve, b: Curve, t: number) => a.map((v, i) => v + (b[i] - v) * t) as Curve;

/** A twisted ribbon of fine lines, interpolated between two cubic curves (Canva's wire mesh). */
function Mesh({ a, b, transform }: { a: Curve; b: Curve; transform?: string }) {
  return (
    <g transform={transform} fill="none" stroke="#b9bdc7" strokeWidth={0.9}>
      {Array.from({ length: 26 }, (_, i) => {
        const [x0, y0, x1, y1, x2, y2, x3, y3] = lerp(a, b, i / 25);
        return <path key={i} d={`M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`} />;
      })}
    </g>
  );
}

/** Ocean Wave: flowing blue side waves and silver mesh (Canva "Blue and White Modern Certificate of Completion"). */
export function TemplateWave({ data }: TemplateProps) {
  const id = useSvgId();
  const [left, right] = data.signatories;
  return (
    <Page background="#ffffff" color={TEXT}>
      <svg aria-hidden width={1123} height={794} viewBox="0 0 1123 794" style={abs(0, 0)}>
        <defs>
          <linearGradient id={id("top")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor="#b4c0de" /><stop offset="1" stopColor="#8d9fcf" />
          </linearGradient>
          <linearGradient id={id("bottom")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8d9fcf" /><stop offset="0.45" stopColor="#ffffff" /><stop offset="1" stopColor="#a7b5da" />
          </linearGradient>
        </defs>

        <path d="M 330 0 C 520 44, 800 76, 1040 60 L 1040 0 Z" fill={`url(#${id("top")})`} opacity={0.75} />
        <path d="M 60 794 C 300 724, 760 720, 1000 794 Z" fill={`url(#${id("bottom")})`} opacity={0.55} />

        <Mesh a={[40, 300, 270, 430, -30, 610, 240, 794]} b={[160, 285, -50, 440, 270, 620, 70, 794]} />
        <Mesh a={[40, 300, 270, 430, -30, 610, 240, 794]} b={[160, 285, -50, 440, 270, 620, 70, 794]} transform="translate(1123 0) scale(-1 1) translate(0 -190)" />

        {/* Left side */}
        <path d="M 0 0 H 166 C 128 140, 64 270, 0 430 Z" fill={SKY} />
        <path d="M 0 0 H 128 C 98 120, 42 236, 0 336 Z" fill={DARK} />
        <path d="M 0 480 C 36 570, 56 690, 46 794 L 0 794 Z" fill={MID} />
        {/* Right side */}
        <path d="M 1000 0 H 1123 V 330 C 1080 205, 1040 92, 1000 0 Z" fill={DARK} />
        <path d="M 1123 318 C 1046 446, 980 606, 958 794 H 1123 Z" fill={SKY} />
        <path d="M 1123 352 C 1066 466, 1008 622, 992 794 H 1123 Z" fill={MID} />
      </svg>

      <Center top={40}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontFamily: fonts.montserrat, fontWeight: 700, fontSize: 13, letterSpacing: 3.5, color: DARK }}>MYLOGINN LEARNING</span>
        </div>
      </Center>
      <Center top={84}><div style={{ fontFamily: fonts.playfair, fontWeight: 500, fontSize: 104, lineHeight: 1, letterSpacing: 2, color: NAVY }}>CERTIFICATE</div></Center>
      <Center top={196}><div style={{ fontFamily: fonts.montserrat, fontWeight: 400, fontSize: 29, letterSpacing: 1.5 }}>OF COURSE COMPLETION</div></Center>
      <Center top={276}><div style={{ fontFamily: fonts.montserrat, fontSize: 16 }}>this certificate is proudly presented to</div></Center>
      <Center top={304}>
        <FitText width={640} maxSize={96} minSize={46} style={{ fontFamily: fonts.allura, color: NAVY, lineHeight: "150px", height: 150 }}>{data.candidateName}</FitText>
      </Center>
      <div style={{ ...abs(241, 462), width: 641, height: 1.8, background: NAVY }} />
      <Center top={484}>
        <FitText width={620} maxSize={16.5} minSize={13} maxHeight={56} fitKey={data.courseTitle} style={{ fontFamily: fonts.montserrat, lineHeight: 1.65 }}>
          <>Awarded for successfully completing <b style={{ color: NAVY }}>{data.courseTitle}</b> and passing its final assessment on <b>{formatCertificateDate(data.completionDate)}</b>.</>
        </FitText>
      </Center>

      <div style={abs(232, 566)}>
        <SignatureBlock signatory={left} ink={NAVY} rule={NAVY} nameColor={TEXT} titleColor="#4b5563" nameFont={fonts.montserrat} titleFont={fonts.montserrat} width={240} ruleWidth={150} />
      </div>
      <div style={abs(651, 566)}>
        <SignatureBlock signatory={right} ink={NAVY} rule={NAVY} nameColor={TEXT} titleColor="#4b5563" nameFont={fonts.montserrat} titleFont={fonts.montserrat} width={240} ruleWidth={150} />
      </div>
      <div style={abs(471, 642)}><Credential id={data.credentialId} font={fonts.montserrat} labelColor="#4b5563" valueColor={NAVY} /></div>
      <SampleMark show={data.sample} />
    </Page>
  );
}
