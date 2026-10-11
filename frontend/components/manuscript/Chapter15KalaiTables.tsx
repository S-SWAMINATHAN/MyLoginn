"use client";

// Chapter 15 — Kalai Magal computation tables (pages 51–56).
// Brings the Kalai-parity sections into the handwritten manuscript:
// Kalachakra dasa, Shodasa varga bala, planet details, Upagraha spudam +
// Prasthara summary, Panchapakshi, and the KP tables. All values come from
// POST /api/kalai/report and POST /api/kalai/kp for the same birth details;
// nothing is computed or invented in the browser.
import React, { useEffect, useState } from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";
import {
  generateKalaiReportApi, generateKpReportApi,
  type KalaiReport, type KpReport, type PakshiSummary,
} from "@/lib/kalaiApi";
import type { GenerateChartRequest } from "@/lib/types";

const CH_TA = "கலைமகள் கணித அட்டவணைகள்";
const CH_EN = "Kalai Magal Computation Tables";
const P9 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const PL_TA: Record<string, string> = {
  Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்", Jupiter: "குரு", Venus: "சுக்கிரன்",
  Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Lagna: "லக்னம்", Uranus: "யுரேனஸ்", Neptune: "நெப்டியூன்", Fortuna: "அதிஷ்டப்பாகை",
};
const SH_TA: Record<string, string> = {
  Sun: "சூரி", Moon: "சந்", Mars: "செவ்", Mercury: "புத", Jupiter: "குரு", Venus: "சுக்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Lagna: "லக்",
};
const DIGNITY_TA: Record<string, string> = { exalted: "உச்சம்", debilitated: "நீசம்", own: "ஆட்சி", friend: "நட்பு", neutral: "சமம்", enemy: "பகை" };
const CLASS_TA: Record<string, string> = { poorna: "பூர்ண", mathima: "மத்திம", adhama: "அதம" };

const nm = (p: string, lang: "ta" | "en") => (lang === "ta" ? PL_TA[p] ?? p : p);
const sh = (p: string, lang: "ta" | "en") => (lang === "ta" ? SH_TA[p] ?? p : p.slice(0, 3));
const cell = "border border-[#aa820a]/40 px-1 py-0.5";

function Loading({ lang, err }: { lang: "ta" | "en"; err: string | null }) {
  return (
    <p className="py-10 text-center text-sm text-[#6b1426]">
      {err ? `${lang === "ta" ? "கணிக்க இயலவில்லை" : "Could not compute"}: ${err}` : lang === "ta" ? "கணிக்கப்படுகிறது…" : "Computing…"}
    </p>
  );
}

function PakshiBlock({ s, lang }: { s: PakshiSummary; lang: "ta" | "en" }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px]">
        <b>{lang === "ta" ? (s.paksha === "shukla" ? "வளர் பிறை" : "தேய்பிறை") : (s.paksha === "shukla" ? "Bright half" : "Dark half")}</b>
        {" · "}{lang === "ta" ? "படுபட்சி நாள்" : "Padu"}: {(lang === "ta" ? s.padu_days_ta : s.padu_days).join(" ")}
        {" · "}{lang === "ta" ? "நிறம்" : "Colour"}: {lang === "ta" ? s.colour_ta : s.colour}
        {" · "}{lang === "ta" ? "திக்கு" : "Direction"}: {lang === "ta" ? s.direction_ta : s.direction}
        {" · "}{lang === "ta" ? "மித்துரு" : "Friends"}: {(lang === "ta" ? s.friends_ta : s.friends).join(" ")}
        {" · "}{lang === "ta" ? "சத்துரு" : "Enemies"}: {(lang === "ta" ? s.enemies_ta : s.enemies).join(" ")}
      </div>
      <table className="w-full border-collapse text-center text-[9.5px]">
        <thead><tr><th className={cell} />{["06-00", "08-24", "10-48", "01-12", "03-36", "06-00", "08-24", "10-48", "01-12", "03-36"].map((x, i) => <th key={i} className={cell}>{x}</th>)}</tr></thead>
        <tbody>{s.grid.map((g) => (
          <tr key={g.day}><td className={`${cell} text-left`}>{lang === "ta" ? g.day_ta : g.day}</td>
            {(lang === "ta" ? g.activities_ta : g.activities).map((a, i) => <td key={i} className={cell}>{a}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}

export const Chapter15KalaiTables: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const [rep, setRep] = useState<KalaiReport | null>(null);
  const [kp, setKp] = useState<KpReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const req = {
      name: chart.name, date_of_birth: chart.date_of_birth, time_of_birth: chart.time_of_birth,
      place: chart.place, latitude: chart.latitude, longitude: chart.longitude, timezone: chart.timezone,
    } as GenerateChartRequest;
    setRep(null); setKp(null); setErr(null);
    Promise.all([generateKalaiReportApi(req), generateKpReportApi(req)])
      .then(([r, k]) => { if (alive) { setRep(r); setKp(k); } })
      .catch((e) => { if (alive) setErr(e instanceof Error ? e.message : String(e)); });
    return () => { alive = false; };
  }, [chart.name, chart.date_of_birth, chart.time_of_birth, chart.latitude, chart.longitude, chart.timezone, chart.place]);

  const wrap = (page: number, ta: string, en: string, body: React.ReactNode) => (
    <PageWrapper pageNumber={page} chapterTitleTa={CH_TA} chapterTitleEn={CH_EN} pageTitleTa={ta} pageTitleEn={en} lang={lang}>
      <div data-kalai-loaded={rep && kp ? "1" : "0"}>{rep && kp ? body : <Loading lang={lang} err={err} />}</div>
    </PageWrapper>
  );

  const kc = rep?.kalachakra;
  const sv = rep?.shodasa_varga;
  const pd = rep?.planet_details;
  const up = rep?.upagraha;
  const pr = rep?.prasthara;
  const pk = rep?.panchapakshi;

  return (
    <>
      {wrap(51, "காலச்சக்கிர தசை", "Kalachakra Dasa",
        kc?.status === "ok" && kc.dashas ? (
          <div className="space-y-2 text-[11px]">
            <p>{lang === "ta" ? "ஓட்டம்" : "Direction"}: <b>{lang === "ta" ? kc.direction_ta : kc.direction}</b> · {lang === "ta" ? "ஜனன கால இருப்பு" : "Balance at birth"}: {kc.dashas[0].balance_ymd?.join(" / ")}</p>
            <table className="w-full border-collapse text-center">
              <thead><tr><th className={cell}>{lang === "ta" ? "தசை" : "Dasa"}</th><th className={cell}>{lang === "ta" ? "வருடம்" : "Years"}</th><th className={cell}>{lang === "ta" ? "ஆரம்பம்" : "Start"}</th><th className={cell}>{lang === "ta" ? "முடிவு" : "End"}</th><th className={cell}>{lang === "ta" ? "புக்திகள்" : "Bhuktis"}</th></tr></thead>
              <tbody>{kc.dashas.map((d) => (
                <tr key={d.start}><td className={cell}>{d.sign_ta} {d.lord_ta}</td><td className={cell}>{d.years}</td><td className={cell}>{d.start}</td><td className={cell}>{d.end}</td>
                  <td className={`${cell} text-left text-[9px]`}>{d.bhuktis.map((b) => `${b.sign_ta.slice(0, 3)} ${b.end}`).join(" · ")}</td></tr>))}</tbody>
            </table>
          </div>) : <Loading lang={lang} err={kc?.error ?? kc?.reason ?? null} />)}

      {wrap(52, "சோடச வர்க்க பலம்", "Shodasa Varga Bala",
        sv?.status === "ok" ? (
          <table className="w-full border-collapse text-center text-[10px]">
            <thead><tr><th className={cell}>{lang === "ta" ? "வர்க்கம்" : "Varga"}</th>{[...P9, "Lagna"].map((p) => <th key={p} className={cell}>{sh(p, lang)}</th>)}</tr></thead>
            <tbody>
              {sv.bala.rows.map((r) => (
                <tr key={r.varga}><td className={`${cell} text-left`}>{lang === "ta" ? r.title_ta : r.title_en}</td>
                  {[...P9, "Lagna"].map((p) => <td key={p} className={cell}>{(r.values[p] ?? 0).toFixed(2)}</td>)}</tr>))}
              <tr className="font-bold"><td className={cell}>{lang === "ta" ? "மொத்தம்" : "Total"}</td>{[...P9, "Lagna"].map((p) => <td key={p} className={cell}>{(sv.bala.totals[p] ?? 0).toFixed(2)}</td>)}</tr>
              <tr className="font-bold"><td className={cell}>{lang === "ta" ? "ரூபங்கள்" : "Rupas"}</td>{[...P9, "Lagna"].map((p) => <td key={p} className={cell}>{(sv.bala.totals_rupas[p] ?? 0).toFixed(2)}</td>)}</tr>
            </tbody>
          </table>) : <Loading lang={lang} err={sv?.error ?? null} />)}

      {wrap(53, "கிரகங்களின் விவர அட்டவணை", "Planet Details",
        pd?.status === "ok" ? (
          <table className="w-full border-collapse text-center text-[10px]">
            <thead><tr>{(lang === "ta"
              ? ["கிரகம்", "பாவகம்", "சுயபாவ பலம் %", "ஆதிபத்தியம்", "கேந்திர/திரிகோணம்", "நிலை", "சேர்க்கை", "பார்வை", "வ/அ/வர்", "பரிவர்த்தனை", "சட்பலம்"]
              : ["Planet", "Bhava", "Own-bhava %", "Lord of", "Kendra/Trikona", "Dignity", "With", "Aspected by", "R/C/V", "Exchange", "Shadbala"]).map((h) => <th key={h} className={cell}>{h}</th>)}</tr></thead>
            <tbody>{pd.rows.map((r) => (
              <tr key={r.planet}>
                <td className={cell}>{nm(r.planet, lang)}</td><td className={cell}>{r.bhava}</td><td className={cell}>{r.suyam_bhava_bala_pct}</td>
                <td className={cell}>{r.lord_of.join(", ")}</td><td className={cell}>{r.status ? (lang === "ta" ? (r.status === "kendra" ? "கேந்திரம்" : "திரிகோணம்") : r.status) : "-"}</td>
                <td className={cell}>{lang === "ta" ? DIGNITY_TA[r.dignity] : r.dignity}</td>
                <td className={cell}>{r.conjunct.map((p) => sh(p, lang)).join(" ") || "-"}</td>
                <td className={cell}>{r.aspected_by.map((p) => sh(p, lang)).join(" ") || "-"}</td>
                <td className={cell}>{[r.retrograde ? (lang === "ta" ? "வ" : "R") : "", r.combust ? (lang === "ta" ? "அ" : "C") : "", r.vargottama ? (lang === "ta" ? "வர்" : "V") : ""].filter(Boolean).join(" ") || "-"}</td>
                <td className={cell}>{r.parivartana_with ? sh(r.parivartana_with, lang) : "-"}</td>
                <td className={cell}>{r.shadbala_rupas != null ? `${r.shadbala_rupas.toFixed(1)} ${r.shadbala_class ? (lang === "ta" ? CLASS_TA[r.shadbala_class] : r.shadbala_class) : ""}` : "-"}</td>
              </tr>))}</tbody>
          </table>) : <Loading lang={lang} err={pd?.error ?? null} />)}

      {wrap(54, "உப கிரக ஸ்புடம் & பிரஸ்தார் சுருக்கம்", "Upagraha Spudam & Prasthara Summary",
        up?.status === "ok" ? (
          <div className="space-y-3 text-[11px]">
            <table className="w-full border-collapse text-center">
              <thead><tr><th className={cell}>{lang === "ta" ? "உப கிரகம்" : "Upagraha"}</th><th className={cell}>{lang === "ta" ? "பா க வி" : "D M S"}</th><th className={cell}>{lang === "ta" ? "ராசியில்" : "In sign"}</th></tr></thead>
              <tbody>{up.rows.map((x) => <tr key={x.key}><td className={`${cell} text-left`}>{lang === "ta" ? x.name_ta : x.key}</td><td className={`${cell} font-mono`}>{x.dms}</td><td className={`${cell} font-mono`}>{x.degree_in_sign_dms}</td></tr>)}</tbody>
            </table>
            {pr?.status === "ok" && (
              <table className="w-full border-collapse text-center text-[10px]">
                <thead><tr><th className={cell}>{lang === "ta" ? "பிரஸ்தார் (ராசி வாரியாக பிந்துக்கள்)" : "Prasthara (bindus per sign)"}</th>{Array.from({ length: 12 }, (_, i) => <th key={i} className={cell}>{i + 1}</th>)}<th className={cell}>{lang === "ta" ? "மொத்தம்" : "Total"}</th></tr></thead>
                <tbody>{Object.values(pr.planets).map((p) => {
                  const bySign = new Array(12).fill(0);
                  p.signs.forEach((s, k) => { bySign[s - 1] = p.column_totals[k]; });
                  return <tr key={p.planet}><td className={`${cell} text-left`}>{nm(p.planet, lang)}</td>{bySign.map((v, i) => <td key={i} className={cell}>{v}</td>)}<td className={cell}>{p.total}</td></tr>;
                })}</tbody>
              </table>)}
          </div>) : <Loading lang={lang} err={up?.error ?? null} />)}

      {wrap(55, "பஞ்சபட்சி", "Panchapakshi",
        pk?.status === "ok" ? (
          <div className="space-y-3">
            <p className="text-center text-sm">{lang === "ta" ? "நட்சத்திர பட்சி" : "Birth bird"}: <b>{lang === "ta" ? pk.birth_bird_ta : pk.birth_bird}</b></p>
            <PakshiBlock s={pk.shukla} lang={lang} />
            <PakshiBlock s={pk.krishna} lang={lang} />
          </div>) : <Loading lang={lang} err={pk?.error ?? null} />)}

      {wrap(56, "கே.பி அட்டவணைகள்", "KP Tables",
        kp ? (
          <div className="space-y-2 text-[10px]">
            <p>{lang === "ta" ? "அயனாம்சம்" : "Ayanamsa"}: {kp.ayanamsa_dms} ({kp.ayanamsa_name})</p>
            <table className="w-full border-collapse text-center">
              <thead><tr>{(lang === "ta" ? ["", "பா க வி", "ராசி", "நட்சத்திர", "உப", "உ.உ"] : ["", "D M S", "Sign", "Star", "Sub", "Sub-sub"]).map((h, i) => <th key={i} className={cell}>{h}</th>)}</tr></thead>
              <tbody>
                {kp.planets.map((p) => <tr key={p.planet}><td className={`${cell} text-left`}>{nm(p.planet, lang)}</td><td className={`${cell} font-mono`}>{p.dms}</td><td className={cell}>{sh(p.sign, lang)}</td><td className={cell}>{sh(p.star, lang)}</td><td className={cell}>{sh(p.sub, lang)}</td><td className={cell}>{sh(p.subsub, lang)}</td></tr>)}
                {kp.cusps.map((c) => <tr key={c.roman}><td className={`${cell} text-left`}>{c.roman}</td><td className={`${cell} font-mono`}>{c.dms}</td><td className={cell}>{sh(c.sign, lang)}</td><td className={cell}>{sh(c.star, lang)}</td><td className={cell}>{sh(c.sub, lang)}</td><td className={cell}>{sh(c.subsub, lang)}</td></tr>)}
              </tbody>
            </table>
            <table className="w-full border-collapse text-center">
              <thead><tr><th className={cell}>{lang === "ta" ? "கிரகம்" : "Planet"}</th><th className={cell}>{lang === "ta" ? "நட்சத்திரப்படி" : "By star"}</th><th className={cell}>{lang === "ta" ? "உபநட்சத்திரப்படி" : "By sub"}</th></tr></thead>
              <tbody>{kp.planet_significators.map((s) => <tr key={s.planet}><td className={cell}>{nm(s.planet, lang)}</td><td className={cell}>{s.by_star.join(", ")}</td><td className={cell}>{s.by_sub.join(", ")}</td></tr>)}</tbody>
            </table>
          </div>) : <Loading lang={lang} err={err} />)}
    </>
  );
};

export default Chapter15KalaiTables;
