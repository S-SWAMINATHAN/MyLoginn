"use client";

// Kalai Magal parity — Computation Report renderer (Phases 1–3).
// Renders ONLY values computed by the backend (/api/kalai/report). Sections
// the backend marks "pending" show a notice, never placeholder numbers
// (AGENTS.md §1.2). Styling uses the existing manuscript tokens
// (--paper / --ink / --red, .hand-card, .table-hand).

import { KalaiChart } from "./KalaiChart";
import { BioDataCard } from "@/components/BioDataCard";
import { toTamil } from "@/lib/tamilTransliterate";
import { to12h } from "@/lib/timeFormat";
import type { ChartStyle } from "@/lib/chartLayouts";
import type { ChartResponse } from "@/lib/types";
import type { KalaiPalan } from "@/lib/kalaiApi";
import React, { useMemo, useRef, useState } from "react";
import type { KalaiAvPlanet, KalaiDasha, KalaiKcDasa, KalaiReport as KalaiReportData, KalaiShadbalaPlanet, PakshiPage, PakshiSummary } from "@/lib/kalaiApi";
import { exportNodesToPdf, safeFileName, waitForRenderReady, type PaperSize } from "@/lib/pdfExport";
import { TIME_CORRECTION_TA, ayanamsaTa, dmsTa, nameTa, timeTa, tzTa } from "@/lib/taText";
import { DIcon } from "@/lib/detailIcons";
import { CELL_BG, centreBackground } from "@/lib/chartArt";

type Lang = "ta" | "en";

const PLANET_SHORT_TA: Record<string, string> = {
  Sun: "சூரி", Moon: "சந்", Mars: "செவ்", Mercury: "புத", Jupiter: "குரு",
  Venus: "சுக்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Lagna: "லக்", Mandi: "மாந்",
};
const PLANET_SHORT_EN: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Lagna: "Asc", Mandi: "Md",
};
const SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"];
const SIGN_EN = ["Mesha", "Rishabha", "Mithuna", "Kataka", "Simha", "Kanni", "Thula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"];

// South Indian layout: grid cell -> rasi number (1..12); centre cells are null.
const SOUTH_GRID: (number | null)[] = [
  12, 1, 2, 3,
  11, null, null, 4,
  10, null, null, 5,
  9, 8, 7, 6,
];

const short = (p: string, lang: Lang) => (lang === "ta" ? PLANET_SHORT_TA[p] : PLANET_SHORT_EN[p]) || p;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Page({ children, pageRef }: { children: React.ReactNode; pageRef?: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={pageRef}
      className="kalai-page story-panel mx-auto w-full space-y-5 rounded-3xl p-6 sm:p-8"
    >
      {children}
    </div>
  );
}

function SectionTitle({ ta, en, lang }: { ta: string; en: string; lang: Lang }) {
  return (
    <h2 className="text-center text-xl font-bold" style={{ color: "var(--jat-accent, #8e2b1c)" }}>
      <DIcon label={lang === "ta" ? ta : en} />
      {lang === "ta" ? ta : en}
    </h2>
  );
}

function Pending({ lang, phase }: { lang: Lang; phase?: string }) {
  return (
    <p className="rounded border border-dashed p-3 text-center text-sm" style={{ borderColor: "var(--jat-gold-40, #d9c8a0)", color: "var(--jat-ink-soft, #6f6049)" }}>
      {lang === "ta"
        ? `இந்தப் பகுதி கலைமகள் இணைப்பின் ${phase ?? "அடுத்த கட்டத்தில்"} சேர்க்கப்படும்.`
        : `This section is added in ${phase ?? "a later phase"} of the Kalai Magal integration.`}
    </p>
  );
}

const ChartCtx = React.createContext<{ style: ChartStyle; lagna: number }>({ style: "tamil", lagna: 1 });

function SouthChart(props: { cells?: Record<string, string[]>; title: string; lang: Lang; numbers?: number[] }) {
  const { style } = React.useContext(ChartCtx);
  if (props.numbers) return <SouthGrid {...props} />;
  return <KalaiChart cells={props.cells ?? {}} style={style} lang={props.lang} title={props.title} titleEn={props.title} />;
}

function SouthGrid({
  cells, title, lang, numbers,
}: { cells?: Record<string, string[]>; title: string; lang: Lang; numbers?: number[] }) {
  // Same artwork as the canvas charts (lib/chartArt); lines and text follow the
  // colour / Tamil-style panel; always an exact square.
  return (
    <div className="mx-auto grid aspect-square w-full max-w-[300px] grid-cols-4 grid-rows-4"
      style={{ border: "2px solid var(--jat-accent, #8e2b1c)" }}>
      {SOUTH_GRID.map((rasi, i) => {
        if (rasi === null) {
          if (i === 5) {
            return (
              <div key={i} className="col-span-2 row-span-2 flex min-h-0 items-center justify-center px-5 text-center text-[13px] font-bold leading-tight"
                style={{ gridColumn: "2 / span 2", gridRow: "2 / span 2", color: "var(--jat-accent, #8e2b1c)", border: "1px solid var(--jat-accent, #8e2b1c)", ...centreBackground() }}>
                {title}
              </div>
            );
          }
          return null;
        }
        const items = cells?.[String(rasi)] ?? [];
        return (
          <div key={i} className="flex min-h-0 flex-col items-center justify-center overflow-hidden p-0.5 text-center text-[12px] font-bold leading-tight"
            style={{ background: CELL_BG, border: "1px solid var(--jat-accent, #8e2b1c)", color: "var(--jat-ink, #2b2117)" }}>
            {numbers ? (
              <span className="text-base font-bold">{numbers[rasi - 1]}</span>
            ) : (
              items.map((p) => <span key={p} style={p === "Lagna" ? { color: "var(--jat-accent, #8e2b1c)" } : undefined}>{short(p, lang)}</span>)
            )}
          </div>
        );
      })}
    </div>
  );
}

const ymd = (a: [number, number, number]) => `${a[0]} ${a[1]} ${a[2]}`;

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function GeneralDetails({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const g = r.general;
  const ta = lang === "ta";
  const T = (x: string) => (ta ? timeTa(x) : x);
  const rows: [string, string, unknown][] = [
    ["பெயர்", "Name", lang === "ta" && g.name ? toTamil(String(g.name)) : g.name],
    ["தந்தை பெயர்", "Father's Name", ta ? nameTa(g.father_name as string) : g.father_name],
    ["தாயார் பெயர்", "Mother's Name", ta ? nameTa(g.mother_name as string) : g.mother_name],
    ["பிறந்த தேதி", "Date of Birth", g.date_of_birth],
    ["பிறந்த நாள்", "Weekday", lang === "ta" ? g.weekday_ta : g.weekday_en],
    ["பிறந்த நேரம்", "Time of Birth", T(to12h(String(g.time_of_birth ?? "")))],
    ["நேர மண்டலம்", "Time Zone", ta ? tzTa(g.timezone as string) : g.timezone],
    ["தமிழ் தேதி", "Tamil Date", lang === "ta" ? g.tamil_date_ta : g.tamil_date_en],
    ["உதயாதி நாழிகை", "Udhayathi Nazhigai", lang === "ta" ? g.udhayadhi_nazhigai : g.udhayadhi_nazhigai_en],
    ["பிறந்த ஊர்", "Place of Birth", g.place],
    ["அட்சாம்சம்", "Latitude", ta ? dmsTa(g.latitude_dms as string) : g.latitude_dms],
    ["தீர்க்காம்சம்", "Longitude", ta ? dmsTa(g.longitude_dms as string) : g.longitude_dms],
    ["சூரிய உதயம்", "Sunrise", `${T(String(g.sun_rise ?? ""))} (${lang === "ta" ? g.sunrise_method_ta : g.sunrise_method_en})`],
    ["சூரிய அஸ்தமனம்", "Sunset", T(String(g.sun_set ?? ""))],
    ["அயனாம்சம்", "Ayanamsa", `${g.ayanamsa_dms ?? ""} (${ta ? ayanamsaTa(String(g.ayanamsa_name ?? "")) : g.ayanamsa_name ?? ""})`],
    ["நட்சத்திர ஹோரை", "Sidereal Time", g.nakshatra_horai],
    ["ஜன்ம ராசி", "Janma Rasi", lang === "ta" ? g.janma_rasi_ta : g.janma_rasi_en],
    ["ஜன்ம நட்சத்திரம்", "Janma Nakshatra", `${lang === "ta" ? g.janma_nakshatra_ta : g.janma_nakshatra_en} ${lang === "ta" ? "பாதம்" : "Pada"} ${g.pada ?? ""}`],
    ["ஜன்ம லக்னம்", "Janma Lagna", lang === "ta" ? g.lagna_ta : g.lagna_en],
    ["யோகம்", "Yogam", lang === "ta" ? g.yogam_ta : g.yogam_en],
    ["கரணம்", "Karanam", lang === "ta" ? g.karanam_ta : g.karanam_en],
    ["திதி", "Thithi", lang === "ta" ? g.thithi_ta : g.thithi_en],
    ["பட்சம்", "Paksham", lang === "ta" ? g.paksha_ta : g.paksha_en],
  ];
  return (
    <div className="table-scroll"><table className="table-hand mx-auto w-full max-w-3xl text-sm">
      <tbody>
        {rows
          .filter(([, , v]) => v !== null && v !== undefined && v !== "")
          .map(([ta, en, v]) => (
            <tr key={en} className="border-b border-[#aa820a]/20">
              <td className="w-[42%] py-1 pr-2 align-top font-semibold"><DIcon label={lang === "ta" ? ta : en} />{lang === "ta" ? ta : en}</td>
              <td className="py-1">: {String(v)}</td>
            </tr>
          ))}
      </tbody>
    </table></div>
  );
}

function GrahaSpudam({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const isVak = String(r.general?.panchangam_system ?? "").toLowerCase() === "vakhyam";
  return (
    <>
      <p className="text-center text-sm">
        {isVak
          ? (lang === "ta" ? "வாக்கிய கிரக ஸ்புடம் (நிராயனம்)" : "Vakkiya Graha Spudam (Nirayana)")
          : (lang === "ta" ? "திருக்கணித கிரக ஸ்புடம் (நிராயனம்)" : "Thirukanitha Graha Spudam (Nirayana)")}
      </p>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-sm">
          <thead>
            <tr>
              <th>{lang === "ta" ? "கிரகம்" : "Planet"}</th>
              <th>{lang === "ta" ? "பா க வி" : "D M S"}</th>
              <th>{lang === "ta" ? "நட்சத்திரம்" : "Nakshatra"}</th>
              <th>{lang === "ta" ? "பாதம்" : "Pada"}</th>
              <th>{lang === "ta" ? "ராசி" : "Rasi"}</th>
              <th>{lang === "ta" ? "பா க வி" : "D M S"}</th>
              <th>{lang === "ta" ? "நவாம்சம்" : "Navamsa"}</th>
            </tr>
          </thead>
          <tbody>
            {r.graha_spudam.map((g) => (
              <tr key={g.planet}>
                <td className="text-left">{lang === "ta" ? g.planet_ta : g.planet}{g.retrograde ? (lang === "ta" ? " (வ)" : " (R)") : ""}</td>
                <td className="font-mono">{g.longitude_dms}</td>
                <td>{g.nakshatra_ta}</td>
                <td>{g.pada}</td>
                <td>{lang === "ta" ? g.rasi_ta : g.rasi_en}</td>
                <td className="font-mono">{g.degree_in_sign_dms}</td>
                <td>{g.navamsa_ta}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 pt-2">
        <SouthChart cells={r.rasi_chart} title={lang === "ta" ? "ராசி" : "Rasi"} lang={lang} />
        <SouthChart cells={r.navamsa_chart} title={lang === "ta" ? "நவாம்சம்" : "Navamsa"} lang={lang} />
      </div>
    </>
  );
}

function BhavaSpudam({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  // bhava_chart is keyed by house number; place houses from the Lagna sign.
  const lagnaSign = useMemo(() => {
    const entry = Object.entries(r.rasi_chart).find(([, ps]) => ps.includes("Lagna"));
    return entry ? Number(entry[0]) : 1;
  }, [r.rasi_chart]);
  const bySign = useMemo(() => {
    const out: Record<string, string[]> = {};
    Object.entries(r.bhava_chart).forEach(([house, ps]) => {
      const sign = ((lagnaSign - 1 + Number(house) - 1) % 12) + 1;
      out[String(sign)] = house === "1" ? ["Lagna", ...ps] : ps;
    });
    return out;
  }, [r.bhava_chart, lagnaSign]);
  return (
    <>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-sm">
          <thead>
            <tr>
              <th rowSpan={2} className="text-left align-bottom">{lang === "ta" ? "பாவம்" : "House"}</th>
              <th colSpan={3}>{lang === "ta" ? "ஆரம்பம்" : "Start"}</th>
              <th colSpan={3}>{lang === "ta" ? "மத்தியம்" : "Middle"}</th>
              <th colSpan={3}>{lang === "ta" ? "அந்திமம்" : "End"}</th>
            </tr>
            <tr>
              {[0, 1, 2].map((g) => (lang === "ta" ? ["பாகை", "கலை", "விகலை"] : ["Deg", "Min", "Sec"]).map((h) => (
                <th key={`${g}-${h}`} className="text-[11px] font-semibold">{h}</th>
              )))}
            </tr>
          </thead>
          <tbody>
            {r.bhava_spudam.map((b) => (
              <tr key={b.house}>
                <td className="whitespace-nowrap text-left">{b.house}. {lang === "ta" ? b.name_ta : `${b.name_en} Bhava`}</td>
                {[b.arambam_dms, b.madhyam_dms, b.anthyam_dms].map((v, k) => String(v).split(" ").map((x, q) => (
                  <td key={`${k}-${q}`} className="font-mono">{x}</td>
                )))}
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div className="flex justify-center pt-2">
        <SouthChart cells={bySign} title={lang === "ta" ? "பாவம்" : "Bhava"} lang={lang} />
      </div>
    </>
  );
}

function DasaColumns({ dashas, lang }: { dashas: KalaiDasha[]; lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dashas.map((d) => (
        <div key={d.start_date} className="rounded border p-2 text-xs" style={{ borderColor: "var(--jat-ink-soft, #6f6049)" }}>
          <div className="font-bold" style={{ color: "var(--jat-accent, #8e2b1c)" }}>
            {lang === "ta" ? `${d.planet_ta} தசா ${d.lord_years} வருடம்` : `${d.planet} Dasa ${d.lord_years} yrs`}
          </div>
          <div>{lang === "ta" ? "ஆரம்ப" : "Start"} {d.start_date_display}</div>
          <div>{lang === "ta" ? "முடிவு" : "End"} {d.end_date_display}</div>
          <div className="table-scroll"><table className="mt-1 w-full table-fixed">
            <colgroup><col style={{ width: "26%" }} /><col style={{ width: "38%" }} /><col style={{ width: "12%" }} /><col style={{ width: "12%" }} /><col style={{ width: "12%" }} /></colgroup>
            <thead>
              <tr>
                <th className="text-left">{lang === "ta" ? "புக்தி" : "Bhukti"}</th>
                <th className="text-left">{lang === "ta" ? "முடிவு" : "Ends"}</th>
                <th className="text-right">{lang === "ta" ? "வ" : "Y"}</th>
                <th className="text-right">{lang === "ta" ? "மா" : "M"}</th>
                <th className="text-right">{lang === "ta" ? "நா" : "D"}</th>
              </tr>
            </thead>
            <tbody>
              {d.bhuktis.map((b) => (
                <tr key={b.end_date} style={b.is_current ? { color: "var(--jat-accent, #8e2b1c)", fontWeight: 700 } : undefined}>
                  <td>{short(b.planet, lang)}</td>
                  <td className="font-mono">{b.end_date_display}</td>
                  <td className="text-right font-mono">{b.age_ymd[0]}</td>
                  <td className="text-right font-mono">{b.age_ymd[1]}</td>
                  <td className="text-right font-mono">{b.age_ymd[2]}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ))}
    </div>
  );
}

function AntharamDasa({ d, lang }: { d: KalaiDasha; lang: Lang }) {
  return (
    <div className="space-y-1">
      <div className="text-center font-bold">{lang === "ta" ? `${d.planet_ta} தசா` : `${d.planet} Dasa`}</div>
      <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 lg:grid-cols-3">
        {d.bhuktis.map((b) => (
          <div key={b.end_date} className="rounded border p-1.5 text-[11px]" >
            <div className="font-semibold">{lang === "ta" ? `${b.planet_ta} புக்தி` : `${b.planet} Bhukti`}</div>
            {b.antardashas.map((a) => (
              <div key={a.end_date + a.planet} className="flex justify-between font-mono" style={a.is_current ? { color: "var(--jat-accent, #8e2b1c)", fontWeight: 700 } : undefined}>
                <span>{short(a.planet, lang)}</span>
                <span>{a.end_date_display}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AvPlanet({ p, lang }: { p: KalaiAvPlanet; lang: Lang }) {
  const figures: [string, string, number][] = [
    ["ஆதிப்பரல்", "Aadhi paral", p.aadhi_paral],
    ["திரிகோணம்", "Trikona", p.trikona_total],
    ["ஏகாதி", "Ekadhipatya", p.ekadhi_total],
    ["இராசி குணகாரம்", "Rasi gunakaram", p.rasi_gunakaram],
    ["கிரக குணகாரம்", "Graha gunakaram", p.graha_gunakaram],
    ["சுத்த பிண்டம்", "Shuddha pindam", p.shuddha_pindam],
    ["குண சமூகம்", "Guna samooham", p.guna_samooham],
    ["ஏக சமூகம்", "Eka samooham", p.eka_samooham],
  ];
  return (
    <div className="space-y-2">
      <div className="text-center font-bold">{lang === "ta" ? `${p.planet_ta} அஷ்ட வர்க்கம்` : `${p.planet} Ashtakavarga`}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SouthChart numbers={p.bav} title={lang === "ta" ? `ஆதிப்பரல் ${p.aadhi_paral}` : `Aadhi ${p.aadhi_paral}`} lang={lang} />
        <SouthChart numbers={p.trikona} title={lang === "ta" ? `திரிகோணம் ${p.trikona_total}` : `Trikona ${p.trikona_total}`} lang={lang} />
        <SouthChart numbers={p.ekadhi} title={lang === "ta" ? `ஏகாதி ${p.ekadhi_total}` : `Ekadhi ${p.ekadhi_total}`} lang={lang} />
      </div>
      <div className="table-scroll"><table className="table-hand mx-auto w-auto text-sm">
        <tbody>
          {figures.map(([ta, en, v]) => (
            <tr key={en} className="border-b border-[#aa820a]/20">
              <td className="whitespace-nowrap py-0.5 pr-6"><DIcon label={lang === "ta" ? ta : en} />{lang === "ta" ? ta : en}</td>
              <td className="whitespace-nowrap py-0.5 font-mono">: {v}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function Sarva({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const av = r.ashtakavarga;
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <SouthChart numbers={av.sarvashtakavarga} title={`${lang === "ta" ? "சர்வாஷ்டக வர்க்கம்" : "Sarvashtakavarga"} (${av.sarvashtakavarga_total})`} lang={lang} />
      </div>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-xs">
          <thead>
            <tr>
              <th />
              {(lang === "ta" ? SIGN_TA : SIGN_EN).map((s) => (
                <th key={s} className="px-0.5 text-[10px] leading-tight break-words">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(av.contributions).map(([planet, row]) => (
              <tr key={planet}>
                <td className="text-left">{short(planet, lang)}</td>
                {row.map((v, i) => <td key={i}>{v}</td>)}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-left">{lang === "ta" ? "மொத்தம்" : "Total"}</td>
              {av.sarvashtakavarga.map((v, i) => <td key={i}>{v}</td>)}
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

function Shadbala({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const sb = r.shadbala;
  if (!sb || sb.status !== "ok") {
    return <p className="text-center text-sm">{sb?.error ?? (lang === "ta" ? "கணிக்க இயலவில்லை" : "Not available")}</p>;
  }
  const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const ps = order.map((p) => sb.planets[p]).filter(Boolean);
  const f = (v: number) => v.toFixed(3);
  const rowsDef: [string, string, keyof KalaiShadbalaPlanet][] = [
    ["1. ஸ்தான பலம்", "1. Sthana bala", "sthana"],
    ["2. கால பலம்", "2. Kala bala", "kala"],
    ["3. திக் பலம்", "3. Dig bala", "dig"],
    ["4. சேஷ்டா பலம்", "4. Cheshta bala", "cheshta"],
    ["5. நைசர்க்கிய பலம்", "5. Naisargika bala", "naisargika"],
    ["6. திருஷ்டி பலம்", "6. Drik bala", "drik"],
  ];
  return (
    <div className="space-y-4">
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-xs">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "பலம் (ரூபம்)" : "Bala (rupas)"}</th>
              {ps.map((p) => <th key={p.planet}>{short(p.planet, lang)}</th>)}
            </tr>
          </thead>
          <tbody>
            {rowsDef.map(([ta, en, k]) => (
              <tr key={en}>
                <td className="text-left">{lang === "ta" ? ta : en}</td>
                {ps.map((p) => <td key={p.planet} className="font-mono">{f(p[k] as number)}</td>)}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-left">{lang === "ta" ? "மொத்தம்" : "Total"}</td>
              {ps.map((p) => <td key={p.planet} className="font-mono">{f(p.total_rupas)}</td>)}
            </tr>
            <tr>
              <td className="text-left">{lang === "ta" ? "இஷ்ட பலம்" : "Ishta phala"}</td>
              {ps.map((p) => <td key={p.planet} className="font-mono">{f(p.ishta)}</td>)}
            </tr>
            <tr>
              <td className="text-left">{lang === "ta" ? "கஷ்ட பலம்" : "Kashta phala"}</td>
              {ps.map((p) => <td key={p.planet} className="font-mono">{f(p.kashta)}</td>)}
            </tr>
          </tbody>
        </table></div>
      </div>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-xs">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th>
              <th>{lang === "ta" ? "சட்பலம்" : "Shadbala"}</th>
              <th>{lang === "ta" ? "பூர்ண பலம்" : "Required"}</th>
              <th>{lang === "ta" ? "சதவிகிதம்" : "%"}</th>
              <th>{lang === "ta" ? "வரிசை" : "Rank"}</th>
            </tr>
          </thead>
          <tbody>
            {ps.map((p) => (
              <tr key={p.planet}>
                <td className="text-left">{lang === "ta" ? p.planet_ta : p.planet}</td>
                <td className="font-mono">{Math.round(p.total_virupas)}</td>
                <td className="font-mono">{p.required_virupas}</td>
                <td className="font-mono">{p.percentage}</td>
                <td className="font-mono">{p.rank}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div className="w-full">
        <p className="text-center text-sm font-semibold">{lang === "ta" ? "பாவக கணிதம்" : "Bhava Bala"}</p>
        <div className="table-scroll"><table className="table-hand w-full text-center text-xs">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "பாவம்" : "Bhava"}</th>
              <th>{lang === "ta" ? "திருஷ்டி" : "Drik"}</th>
              <th>{lang === "ta" ? "திக்" : "Dig"}</th>
              <th>{lang === "ta" ? "பாவாதிபதி" : "Lord"}</th>
              <th>{lang === "ta" ? "மொத்தம்" : "Total"}</th>
              <th>{lang === "ta" ? "வரிசை" : "Rank"}</th>
            </tr>
          </thead>
          <tbody>
            {sb.bhavas.map((b) => (
              <tr key={b.house}>
                <td className="text-left">{b.house} ({lang === "ta" ? b.lord_ta : b.lord})</td>
                <td className="font-mono">{f(b.drik)}</td>
                <td className="font-mono">{f(b.dig)}</td>
                <td className="font-mono">{f(b.adhipati)}</td>
                <td className="font-mono font-bold">{f(b.total_rupas)}</td>
                <td className="font-mono">{b.rank}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

const POINT_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Lagna"];

function ShodasaVarga({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const sv = r.shodasa_varga;
  if (!sv || sv.status !== "ok") return <p className="text-center text-sm">{sv?.error ?? "—"}</p>;
  const codes = sv.bala.rows.map((row) => row.varga);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {codes.map((code) => {
          const ch = sv.charts[code];
          const cells: Record<string, string[]> = {};
          POINT_ORDER.forEach((p) => {
            const s = String(ch.signs[p]);
            (cells[s] = cells[s] || []).push(p);
          });
          return <SouthChart key={code} cells={cells} title={`${code} ${lang === "ta" ? ch.title_ta : ch.title_en}`} lang={lang} />;
        })}
      </div>
    </div>
  );
}

function ShodasaVargaTables({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const sv = r.shodasa_varga;
  if (!sv || sv.status !== "ok") return null;
  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-semibold">{lang === "ta" ? "சோடச வர்க்க பலம்" : "Shodasa Varga Bala"}</p>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-[11px]">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "வர்க்கம்" : "Varga"}</th>
              {POINT_ORDER.map((p) => <th key={p}>{short(p, lang)}</th>)}
            </tr>
          </thead>
          <tbody>
            {sv.bala.rows.map((row) => (
              <tr key={row.varga}>
                <td className="text-left">{lang === "ta" ? row.title_ta : row.title_en}</td>
                {POINT_ORDER.map((p) => <td key={p} className="font-mono">{row.values[p].toFixed(2)}</td>)}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-left">{lang === "ta" ? "மொத்தம்" : "Total"}</td>
              {POINT_ORDER.map((p) => <td key={p} className="font-mono">{sv.bala.totals[p].toFixed(2)}</td>)}
            </tr>
            <tr>
              <td className="text-left">{lang === "ta" ? "மொத்தம் (ரூபங்கள்)" : "Total (rupas)"}</td>
              {POINT_ORDER.map((p) => <td key={p} className="font-mono">{sv.bala.totals_rupas[p].toFixed(2)}</td>)}
            </tr>
          </tbody>
        </table></div>
      </div>
      <p className="text-center text-sm font-semibold">{lang === "ta" ? "வர்காதிபதி" : "Varga Lords"}</p>
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-[11px]">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "வர்க்கம்" : "Varga"}</th>
              {["Lagna", ...POINT_ORDER.slice(0, 9)].map((p) => <th key={p}>{short(p, lang)}</th>)}
            </tr>
          </thead>
          <tbody>
            {sv.bala.rows.map((row) => (
              <tr key={row.varga}>
                <td className="text-left">{lang === "ta" ? row.title_ta : row.title_en}</td>
                {["Lagna", ...POINT_ORDER.slice(0, 9)].map((p) => (
                  <td key={p}>{short(sv.charts[row.varga].lords[p], lang)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

const DIGNITY_TA: Record<string, string> = {
  exalted: "உச்சம்", debilitated: "நீசம்", own: "ஆட்சி", friend: "நட்பு", neutral: "சமம்", enemy: "பகை",
};
const CLASS_TA: Record<string, string> = { poorna: "பூர்ண", mathima: "மத்திம", adhama: "அதம" };

function PlanetDetails({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const pd = r.planet_details;
  if (!pd || pd.status !== "ok") return <p className="text-center text-sm">{pd?.error ?? "—"}</p>;
  const list = (xs: string[]) => (xs.length ? xs.map((x) => short(x, lang)).join(" ") : "—");
  return (
    <div className="space-y-3">
      <div className="w-full">
        <div className="table-scroll"><table className="table-hand w-full text-center text-[11px]">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th>
              <th>{lang === "ta" ? "பாவம்" : "Bhava"}</th>
              <th>{lang === "ta" ? "சுயம் பாவ பலம் %" : "Own-bhava %"}</th>
              <th>{lang === "ta" ? "ஆதிபத்யம்" : "Lord of"}</th>
              <th>{lang === "ta" ? "கேந்/திரி" : "Kendra/Trikona"}</th>
              <th>{lang === "ta" ? "நிலை" : "Dignity"}</th>
              <th>{lang === "ta" ? "சேர்க்கை" : "Conjunct"}</th>
              <th>{lang === "ta" ? "பார்வை" : "Aspected by"}</th>
              <th>{lang === "ta" ? "வக்/அஸ்/வர்" : "R/C/V"}</th>
              <th>{lang === "ta" ? "பரிவர்த்தனை" : "Exchange"}</th>
              <th>{lang === "ta" ? "சட்பலம்" : "Shadbala"}</th>
            </tr>
          </thead>
          <tbody>
            {pd.rows.map((row) => (
              <tr key={row.planet}>
                <td className="text-left">{short(row.planet, lang)}</td>
                <td>{row.bhava}</td>
                <td>{row.suyam_bhava_bala_pct}</td>
                <td>{row.lord_of.length ? row.lord_of.join(" ") : "—"}</td>
                <td>{row.status ? (lang === "ta" ? (row.status === "kendra" ? "கேந்" : "திரி") : row.status) : "—"}</td>
                <td>{lang === "ta" ? DIGNITY_TA[row.dignity] : row.dignity}</td>
                <td>{list(row.conjunct)}</td>
                <td>{list(row.aspected_by)}</td>
                <td>
                  {[row.retrograde && (lang === "ta" ? "வக்" : "R"), row.combust && (lang === "ta" ? "அஸ்" : "C"), row.vargottama && (lang === "ta" ? "வர்" : "V")]
                    .filter(Boolean).join(" ") || "—"}
                </td>
                <td>{row.parivartana_with ? short(row.parivartana_with, lang) : "—"}</td>
                <td>
                  {row.shadbala_rupas !== null
                    ? `${row.shadbala_rupas.toFixed(1)} (${lang === "ta" ? CLASS_TA[row.shadbala_class ?? ""] ?? "" : row.shadbala_class ?? ""})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      {pd.wars.map((w) => (
        <p key={w.planets.join("-")} className="text-center text-sm">
          {lang === "ta"
            ? `${w.planets.map((p) => short(p, lang)).join(", ")} கிரக யுத்தத்தில் உள்ளன. ${short(w.winner, lang)} யுத்தத்தில் வெற்றி பெற்றுள்ளது.`
            : `${w.planets.join(" and ")} are in planetary war; ${w.winner} wins.`}
        </p>
      ))}
    </div>
  );
}

function Kalachakra({ d, first, lang, dirTa, dirEn }: { d: KalaiKcDasa; first: boolean; lang: Lang; dirTa: string; dirEn: string }) {
  return (
    <div className="space-y-2">
      <p className="text-center text-sm font-semibold">
        {lang === "ta"
          ? `${dirTa} ${d.sign_ta} ${d.lord_ta} தசா ${first && d.balance_ymd ? `${d.balance_ymd[0]} வருடம் ${d.balance_ymd[1]} மாதம் ${d.balance_ymd[2]} நாள்` : `${d.years} வருடம்`}`
          : `${dirEn} ${d.sign} dasa — ${first && d.balance_ymd ? `balance ${d.balance_ymd.join(" / ")} (y/m/d)` : `${d.years} years`}`}
      </p>
      {d.bhuktis.length > 0 ? (
        <div className="table-scroll"><table className="table-hand mx-auto w-full max-w-lg text-center text-xs">
          <thead>
            <tr>
              <th className="text-left">{lang === "ta" ? "புக்தி" : "Bhukti"}</th>
              <th>{lang === "ta" ? "ஆரம்ப தேதி" : "Start"}</th>
              <th>{lang === "ta" ? "முடிவு தேதி" : "End"}</th>
              <th className="text-right">{lang === "ta" ? "வ" : "Y"}</th>
              <th className="text-right">{lang === "ta" ? "மா" : "M"}</th>
              <th className="text-right">{lang === "ta" ? "நா" : "D"}</th>
            </tr>
          </thead>
          <tbody>
            {d.bhuktis.map((b) => (
              <tr key={b.start + b.sign}>
                <td className="text-left">{lang === "ta" ? `${b.sign_ta} ${b.lord_ta}` : b.sign}</td>
                <td className="font-mono">{b.start}</td>
                <td className="font-mono">{b.end}</td>
                <td className="text-right font-mono">{b.age_ymd[0]}</td>
                <td className="text-right font-mono">{b.age_ymd[1]}</td>
                <td className="text-right font-mono">{b.age_ymd[2]}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      ) : (
        <p className="text-center text-xs">{lang === "ta" ? "நடப்பு புக்தி — சரிபார்ப்பு நிலுவையில்" : "Running bhukti — verification pending"}</p>
      )}
    </div>
  );
}

const BIRD_TA: Record<string, string> = { Vulture: "வல்லூறு", Owl: "ஆந்தை", Crow: "காகம்", Cock: "கோழி", Peacock: "மயில்" };
const REL_TA: Record<string, string> = { Self: "சுயம்", Friend: "நட்பு", Enemy: "பகை" };
const DAYEN_TA: Record<string, string> = { Sunday: "ஞாயிறு", Monday: "திங்கள்", Tuesday: "செவ்வாய்", Wednesday: "புதன்", Thursday: "வியாழன்", Friday: "வெள்ளி", Saturday: "சனி" };

function PakshiHalf({ s, lang }: { s: PakshiSummary; lang: Lang }) {
  const slots = ["06-00", "08-24", "10-48", "01-12", "03-36"];
  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <div>{lang === "ta" ? "நட்சத்திர பட்சி" : "Birth bird"}: <b>{lang === "ta" ? s.bird_ta : s.bird}</b> — {lang === "ta" ? (s.paksha === "shukla" ? "வளர் பிறை" : "தேய்பிறை") : (s.paksha === "shukla" ? "Bright half" : "Dark half")}</div>
        <div>{lang === "ta" ? "படுபட்சி நாள்" : "Padu days"}: {(lang === "ta" ? s.padu_days_ta : s.padu_days).join(" ")}</div>
        <div>{lang === "ta" ? "பெயர் முதலெழுத்து" : "Name letters"}: {s.letters}</div>
        <div>{lang === "ta" ? "நிறம்" : "Colour"}: {lang === "ta" ? s.colour_ta : s.colour} · {lang === "ta" ? "திக்கு" : "Direction"}: {lang === "ta" ? s.direction_ta : s.direction}</div>
        <div>{lang === "ta" ? "அதிகார பட்சி" : "Ruling"}: {(lang === "ta" ? s.ruling_day_ta : s.ruling_day).join(" ")} {lang === "ta" ? "பகல்" : "(day)"} · {(lang === "ta" ? s.ruling_night_ta : s.ruling_night).join(" ")} {lang === "ta" ? "இரவு" : "(night)"}</div>
        <div>{lang === "ta" ? "மித்துரு" : "Friends"}: {(lang === "ta" ? s.friends_ta : s.friends).join(" ")} · {lang === "ta" ? "சத்துரு" : "Enemies"}: {(lang === "ta" ? s.enemies_ta : s.enemies).join(" ")}</div>
      </div>
      <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-[10px]">
        <thead>
          <tr><th />{[0, 1].map((h) => <th key={h} colSpan={5}>{lang === "ta" ? (h ? "இரவு தொழில்" : "பகல் தொழில்") : (h ? "Night activity" : "Day activity")}</th>)}</tr>
          <tr><th>{lang === "ta" ? "கிழமை" : "Day"}</th>{[...slots, ...slots].map((x, i) => <th key={i}>{x}</th>)}</tr>
        </thead>
        <tbody>{s.grid.map((g) => <tr key={g.day}><td className="text-left">{lang === "ta" ? g.day_ta : g.day}</td>{(lang === "ta" ? g.activities_ta : g.activities).map((a, i) => <td key={i}>{a}</td>)}</tr>)}</tbody>
      </table></div></div>
    </div>
  );
}

function PakshiDetailedPage({ p, birth, lang }: { p: PakshiPage; birth: string; lang: Lang }) {
  return (
    <div className="space-y-2 text-[10px]">
      <div className="text-center text-xs font-semibold">
        {lang === "ta" ? BIRD_TA[birth] : birth} · {lang === "ta" ? (p.paksha === "shukla" ? "வளர் பிறை" : "தேய்பிறை") : (p.paksha === "shukla" ? "Bright half" : "Dark half")} · {(lang === "ta" ? p.weekdays_ta : p.weekdays).join(" ")} · {lang === "ta" ? (p.part === "day" ? "பகல்" : "இரவு") : (p.part === "day" ? "Day" : "Night")}
      </div>
      <div className="text-center">
        {lang === "ta" ? "படுபட்சி" : "Padu"}: {p.padu.map((x) => `${lang === "ta" ? DAYEN_TA[x.day] : x.day}-${x.bird ? (lang === "ta" ? BIRD_TA[x.bird] : x.bird) : "—"}`).join("  ")} · {lang === "ta" ? "அதிகார பட்சி" : "Ruling bird"}: {p.ruling_bird ? (lang === "ta" ? BIRD_TA[p.ruling_bird] : p.ruling_bird) : "—"}
      </div>
      <div className="table-scroll"><table className="table-hand w-full text-center">
        <thead><tr><th>{lang === "ta" ? "யாமம்" : "Yama"}</th><th>{lang === "ta" ? "தொழில்" : "Activity"}</th><th>{lang === "ta" ? "பட்சி" : "Bird"}</th><th>{lang === "ta" ? "உப தொழில்" : "Sub act"}</th><th>{lang === "ta" ? "நேரம்" : "Time"}</th><th>{lang === "ta" ? "உறவு" : "Relation"}</th><th>{lang === "ta" ? "பலன்" : "Result"}</th></tr></thead>
        <tbody>{p.yamas.map((y) => y.subs.map((s, i) => (
          <tr key={`${y.yama}-${i}`}>
            {i === 0 && <td rowSpan={5}>{y.yama}<br />{y.start}–{y.end}</td>}
            {i === 0 && <td rowSpan={5}>{lang === "ta" ? y.activity_ta : y.activity}</td>}
            <td>{lang === "ta" ? s.bird_ta : s.bird}</td><td>{lang === "ta" ? s.activity_ta : s.activity}</td>
            <td className="font-mono">{s.start}–{s.end}</td><td>{lang === "ta" ? REL_TA[s.relation] : s.relation}</td>
            <td>{lang === "ta" ? s.result_ta : s.result}</td>
          </tr>)))}</tbody>
      </table></div>
    </div>
  );
}

const UPA_EN: Record<string, string> = { gulika: "Gulika", yamaghantaka: "Yamaghantaka", ardhaprahara: "Ardhaprahara", kala: "Kala",
  mrityu: "Mrityu", dhuma: "Dhuma", vyatipata: "Vyatipata", parivesha: "Parivesha", indrachapa: "Indrachapa", upaketu: "Upaketu" };

function Upagraha({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const u = r.upagraha;
  if (!u || u.status !== "ok") return <p className="text-center text-sm">{u?.error ?? "—"}</p>;
  const cells: Record<string, string[]> = {};
  u.rows.forEach((x) => (cells[String(x.sign)] = [...(cells[String(x.sign)] || []), x.key]));
  return (
    <div className="space-y-3">
      <div className="table-scroll"><table className="table-hand w-full text-center text-sm">
        <thead><tr><th className="text-left">{lang === "ta" ? "உப கிரகம்" : "Upagraha"}</th><th>{lang === "ta" ? "பா க வி" : "D M S"}</th><th>{lang === "ta" ? "ராசி" : "Rasi"}</th><th>{lang === "ta" ? "பா க வி" : "D M S"}</th></tr></thead>
        <tbody>{u.rows.map((x) => (
          <tr key={x.key}><td className="text-left">{lang === "ta" ? x.name_ta : UPA_EN[x.key]}</td><td className="font-mono">{x.dms}</td>
            <td>{lang === "ta" ? SIGN_TA[x.sign - 1] : SIGN_EN[x.sign - 1]}</td><td className="font-mono">{x.degree_in_sign_dms}</td></tr>))}
        </tbody>
      </table></div>
    </div>
  );
}

function Prasthara({ p, lang }: { p: NonNullable<KalaiReportData["prasthara"]>["planets"][string]; lang: Lang }) {
  return (
    <div className="space-y-1">
      <div className="text-center text-sm font-semibold">{lang === "ta" ? `${p.planet_ta} பிரஸ்தார் அஷ்டவர்க்கம்` : `${p.planet} Prasthara Ashtakavarga`}</div>
      <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-[10px]">
        <thead><tr><th />{(lang === "ta" ? p.signs_ta : p.signs.map((s) => SIGN_EN[s - 1])).map((s, i) => <th key={i} className="px-0.5 text-[10px] leading-tight break-words">{s}</th>)}<th>{lang === "ta" ? "மொத்தம்" : "Total"}</th></tr></thead>
        <tbody>
          {p.rows.map((row) => (
            <tr key={row.donor}><td className="text-left">{row.donor === "Lagna" ? (lang === "ta" ? "லக்" : "Asc") : short(row.donor, lang)}</td>
              {row.cells.map((c, i) => <td key={i}>{c ? "●" : "–"}</td>)}<td className="font-mono">{row.total}</td></tr>))}
          <tr className="font-bold"><td />{p.column_totals.map((c, i) => <td key={i} className="font-mono">{c}</td>)}<td className="font-mono">{p.total}</td></tr>
        </tbody>
      </table></div></div>
    </div>
  );
}

const LETTER_VALUES: [string, number][] = [["A", 1], ["B", 2], ["C", 3], ["D", 4], ["E", 5], ["F", 8], ["G", 3], ["H", 5], ["I", 1],
  ["J", 1], ["K", 2], ["L", 3], ["M", 4], ["N", 5], ["O", 7], ["P", 8], ["Q", 1], ["R", 2], ["S", 3], ["T", 4], ["U", 6], ["V", 6],
  ["W", 6], ["X", 5], ["Y", 1], ["Z", 7]];

function Numerology({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const sp = r.single_page;
  const d = (r.numerology.status === "ok" ? r.numerology.data : null) as Record<string, any> | null;
  const b = d?.birth_number_attributes ?? {};
  const rows: [string, string, string | undefined][] = [
    ["பிறந்த தேதி", "Date of birth", String(r.general.date_of_birth ?? "")],
    ["பிறந்த தேதி எண்", "Birth number", sp ? String(sp.date_number) : d?.birth_number],
    ["தேதியின் கூட்டு எண்", "Destiny number", sp ? String(sp.destiny_number) : d?.destiny_number],
    ["கிரகம்", "Planet", lang === "ta" ? d?.birth_number_planet_ta : d?.birth_number_planet],
    ["அதிர்ஷ்ட எண்கள்", "Lucky numbers", (b.lucky_numbers ?? []).join(", ")],
    ["அதிர்ஷ்ட நிறங்கள்", "Lucky colours", ((lang === "ta" ? b.lucky_colors_ta : b.lucky_colors) ?? []).join(", ")],
    ["அதிர்ஷ்ட நாட்கள்", "Lucky days", ((lang === "ta" ? b.lucky_days_ta : b.lucky_days) ?? []).join(", ")],
    ["பெயர் எண்", "Name number", d ? `${d.name_number} (${d.name_compound_total})` : undefined],
    ["பெயர் எண் நிலை", "Name number status", lang === "ta" ? d?.alignment_status_ta : d?.alignment_status],
  ];
  return (
    <div className="space-y-4 text-sm">
      <div className="table-scroll"><table className="w-full border-collapse">
        <tbody>
          {rows.filter(([, , v]) => v !== undefined && v !== "").map(([ta, en, v]) => (
            <tr key={en} className="border-b border-[#aa820a]/40">
              <td className="w-2/5 py-1.5 pr-3 align-top font-semibold"><DIcon label={lang === "ta" ? ta : en} />{lang === "ta" ? ta : en}</td>
              <td className="py-1.5 align-top break-words">{v}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {d && <p className="leading-relaxed">{lang === "ta" ? d.analysis_ta : d.analysis}</p>}
      {sp && (
        <p className="font-semibold">
          {lang === "ta" ? "நியுமராலஜிப்படி அமைக்க வேண்டிய பெயரின் கூட்டு எண்" : "Name numbers by numerology"}: {sp.name_numbers.join(", ")}
        </p>
      )}
      <div className="table-scroll"><table className="w-full table-fixed border-collapse text-center text-xs">
        <tbody>
          <tr>{LETTER_VALUES.slice(0, 13).map(([l]) => <td key={l} className="border border-[#aa820a]/40 py-1 font-semibold">{l}</td>)}</tr>
          <tr>{LETTER_VALUES.slice(0, 13).map(([l, v]) => <td key={l} className="border border-[#aa820a]/40 py-1">{v}</td>)}</tr>
          <tr>{LETTER_VALUES.slice(13).map(([l]) => <td key={l} className="border border-[#aa820a]/40 py-1 font-semibold">{l}</td>)}</tr>
          <tr>{LETTER_VALUES.slice(13).map(([l, v]) => <td key={l} className="border border-[#aa820a]/40 py-1">{v}</td>)}</tr>
        </tbody>
      </table></div>
    </div>
  );
}

/* Single-page horoscope — ONE A4 sheet in Kalai's layout (Thirukanitam_single_page.pdf):
   invocation · details in two label : value columns · planets in two side-by-side
   tables · Rasi and Navamsam side by side · bhava change, dasa balance, current
   dasa-bhukti, name numbers, star letters · சுபம். */
/** Only the place the user typed: "உடுமலைபேட்டை, தமிழ்நாடு, இந்தியா" → "உடுமலைபேட்டை",
 *  "Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India" → "Udumalaipettai". */
function shortPlace(place: string): string {
  return place.split(",").map((x) => x.trim()).filter(Boolean)[0] ?? "";
}

/** Small deity picture for a top corner (transparent PNG, no background). */
function CornerDeity({ kind }: { kind: "ganesha" | "murugan" | "om" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/deity/${kind}.png`} alt="" className="h-[68px] w-auto max-w-[84px] object-contain" />;
}

function SinglePage({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const sp = r.single_page;
  const g = r.general as Record<string, string | number | null>;
  const ta = lang === "ta";
  const L = (a: string, b: string) => (ta ? a : b);
  const dob = String(g.date_of_birth ?? "");
  const dd = dob.split("-").reverse().join("-");
  const tob = String(g.time_of_birth ?? "");
  const sunRow = r.graha_spudam.find((x) => x.planet === "Sun");
  const sunLon = sunRow ? Number((sunRow as unknown as { longitude: number }).longitude) : 0;
  const north = sunLon >= 270 || sunLon < 90;
  const left: [string, string][] = [
    [L("பெயர்", "Name"), String(g.name ?? "")],
    [L("தந்தை பெயர்", "Father's name"), ta ? nameTa(String(g.father_name ?? "")) : String(g.father_name ?? "")],
    [L("தாயார் பெயர்", "Mother's name"), ta ? nameTa(String(g.mother_name ?? "")) : String(g.mother_name ?? "")],
    [L("பிறந்த தேதி", "Date of birth"), `${dd} ${ta ? String(g.weekday_ta ?? "").replace("க்கிழமை", "") : String(g.weekday_en ?? "")}`],
    [L("தமிழ் தேதி", "Tamil date"), String(ta ? g.tamil_date_ta ?? "" : g.tamil_date_en ?? "")],
    [L("பிறந்த நேரம்", "Time of birth"), ta ? timeTa(to12h(tob)) : to12h(tob)],
    [L("நட்சத்திர ஹோரை", "Sidereal time"), String(g.nakshatra_horai ?? "")],
    [L("அயனாம்சம்", "Ayanamsa"), `${String(g.ayanamsa_dms ?? "")} (${String(g.panchangam_system ?? "").toLowerCase() === "vakhyam" ? L("வாக்கியம்", "Vakkiyam") : L("லஹரி", "Lahiri")})`],
    [L("சூரிய உதயம்", "Sunrise"), `${ta ? timeTa(String(g.sun_rise ?? "")) : String(g.sun_rise ?? "")} (${ta ? String(g.sunrise_method_ta ?? "") : "disc centre"})`],
    [L("சூரிய அஸ்தமனம்", "Sunset"), ta ? timeTa(String(g.sun_set ?? "")) : String(g.sun_set ?? "")],
    [L("நேர திருத்தம்", "Time correction"), L(TIME_CORRECTION_TA, "Standard Time (No Correction)")],
  ];
  const right: [string, string][] = [
    [L("பிறந்த ஊர்", "Place of birth"), shortPlace(String(g.place ?? ""))],
    [L("அட்சாம்சம்", "Latitude"), ta ? dmsTa(String(g.latitude_dms ?? "")) : String(g.latitude_dms ?? "")],
    [L("தீர்க்காம்சம்", "Longitude"), ta ? dmsTa(String(g.longitude_dms ?? "")) : String(g.longitude_dms ?? "")],
    [L("ஜன்ம நட்சத்திரம்", "Birth star"), `${String(ta ? g.janma_nakshatra_ta ?? "" : g.janma_nakshatra_en ?? "")} ${L("பாதம்", "pada")} ${String(g.pada ?? "")}`],
    [L("ஜன்ம ராசி", "Moon sign"), String(ta ? g.janma_rasi_ta ?? "" : g.janma_rasi_en ?? "")],
    [L("ஜன்ம லக்னம்", "Lagna"), String(ta ? g.lagna_ta ?? "" : g.lagna_en ?? "")],
    [L("திதி", "Tithi"), String(ta ? g.thithi_ta ?? "" : g.thithi_en ?? "")],
    [L("யோகம்", "Yogam"), String(ta ? g.yogam_ta ?? "" : g.yogam_en ?? "")],
    [L("கரணம்", "Karanam"), String(ta ? g.karanam_ta ?? "" : g.karanam_en ?? "")],
    [L("அயனம்", "Ayanam"), north ? L("உத்தராயணம்", "Uttarayana") : L("தட்சிணாயனம்", "Dakshinayana")],
    [L("நேர மண்டலம்", "Time zone"), ta ? tzTa(String(g.timezone ?? "")) : String(g.timezone ?? "")],
  ];
  const half = Math.ceil(r.graha_spudam.length / 2);
  const ptable = (rows: typeof r.graha_spudam) => (
    <div className="table-scroll"><table className="w-full text-[12px]">
      <thead>
        <tr className="border-y border-current">
          <th className="text-left">{L("கிரகம்", "Planet")}</th>
          <th className="text-right" colSpan={3}>{L("பாகை", "Longitude")}</th>
          <th className="text-left pl-2">{L("நட்சத்திரம்", "Star")}</th>
          <th className="text-right whitespace-nowrap">{L("பாதம்", "Pada")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((x) => {
          const d = String(x.longitude_dms).split(" ");
          return (
            <tr key={x.planet}>
              <td>{ta ? x.planet_ta : x.planet}{x.retrograde ? (ta ? " (வ)" : " (R)") : ""}</td>
              <td className="text-right font-mono">{d[0]}</td><td className="text-right font-mono">{d[1]}</td><td className="text-right font-mono">{d[2]}</td>
              <td className="pl-2">{ta ? x.nakshatra_ta : (x as unknown as { nakshatra_en?: string }).nakshatra_en ?? x.nakshatra_ta}</td>
              <td className="text-right">{x.pada}</td>
            </tr>
          );
        })}
      </tbody>
    </table></div>
  );
  const bal = String((ta ? r.dasa_balance.kalai_ta ?? r.dasa_balance.formatted_ta : r.dasa_balance.formatted_en) ?? "")
    .replace("ஜனன கால தசை இருப்பு", "").replace(/^[\s:]+/, "");
  const bottom: [string, string][] = [];
  if (sp) {
    bottom.push([L("பாவக மாற்றம்", "Bhava change"), sp.bhava_moves.length ? sp.bhava_moves.map((m) => `${m.planet_ta}(${m.bhava_sign_ta})`).join(" ") : L("இல்லை", "None")]);
  }
  bottom.push([L("ஜனன கால தசை இருப்பு", "Dasa balance at birth"), bal]);
  if (sp?.current_dasa_bhukti) {
    const c = sp.current_dasa_bhukti;
    bottom.push([L("நடப்பு தசா புக்தி முடிவு தேதி", "Current dasa-bhukti ends"), ta ? `${c.dasa_ta} தசா ${c.bhukti_ta} புக்தி ${c.end}` : `${c.dasa} dasa ${c.bhukti} bhukti ${c.end}`]);
  }
  if (sp) {
    bottom.push([L("நியுமராலஜிப்படி பெயரின் கூட்டு எண்", "Name numbers by numerology"), sp.name_numbers.join("-")]);
    bottom.push([L("நட்சத்திரப்படி பெயரின் முதல் எழுத்து", "First letters by star"), sp.star_letters.display]);
  }
  const udh = L("உதயாதி நாழிகை", "Udhayadi nazhigai");
  return (
    // page border in the colour panel's gold (double) and accent (inner line), like the printed sheet
    <div className="single-sheet rounded-sm p-2" style={{ border: "4px double var(--jat-gold, #d4af37)" }}>
    <div className="space-y-3 p-3 text-[13px] leading-snug sm:p-4" style={{ border: "1px solid var(--jat-accent, #8e2b1c)" }}>
      <div className="grid grid-cols-[84px_1fr_84px] items-center gap-2 text-center">
        <div className="flex justify-center"><CornerDeity kind="ganesha" /></div>
        <div>
          <div className="font-bold text-[#8e2b1c]">ஓம் நமச்சிவாய</div>
          <div className="text-[12px]">ஜெனனீ ஜென்ம சௌக்கியானாம் வர்த்தனீ குல சம்பதாம்<br />பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்திரிகா</div>
          <div className="text-right text-[11px]">{new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}</div>
        </div>
        <div className="flex justify-center"><CornerDeity kind="murugan" /></div>
      </div>
      {/* phones: the same details as one label : value column (the two-column sheet
          below is used on wider screens, in the PDF and in print) */}
      <div className="sheet-narrow">
        <table className="w-full">
          <tbody>
            {[...left, ...right, [udh, `${String(ta ? g.udhayadhi_nazhigai ?? "" : g.udhayadhi_nazhigai_en ?? "")} ${dd}`]].map(([a, b]) => (
              <tr key={`n-${a}`}>
                <td className="w-[44%] align-top"><DIcon label={String(a)} />{a}</td>
                <td className="w-3 text-center align-top">:</td>
                <td className="align-top">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-scroll sheet-wide"><table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "22.4%" }} /><col style={{ width: "1.4%" }} /><col style={{ width: "27.6%" }} /><col style={{ width: "0.8%" }} />
          <col style={{ width: "20%" }} /><col style={{ width: "1.4%" }} /><col style={{ width: "26.4%" }} />
        </colgroup>
        <tbody>
          {left.map(([a, b], i) => (
            <tr key={a}>
              <td className="align-top"><DIcon label={a} />{a}</td><td className="text-center align-top">:</td><td className="align-top">{b}</td>
              <td />
              <td className="align-top"><DIcon label={right[i][0]} />{right[i][0]}</td><td className="text-center align-top">:</td><td className="align-top">{right[i][1]}</td>
            </tr>
          ))}
          <tr><td className="align-top"><DIcon label={udh} />{udh}</td><td className="text-center align-top">:</td>
            <td colSpan={5}>{String(ta ? g.udhayadhi_nazhigai ?? "" : g.udhayadhi_nazhigai_en ?? "")} {dd}</td></tr>
        </tbody>
      </table></div>
      <h3 className="text-center font-bold text-[#8e2b1c]">
        {String(g.panchangam_system ?? "").toLowerCase() === "vakhyam"
          ? L("வாக்கிய கிரக ஸ்புடம் (நிராயனம்)", "Vakkiyam planetary positions (sidereal)")
          : L("திருக்கணித கிரக ஸ்புடம் (நிராயனம்)", "Thirukanitham planetary positions (sidereal)")}
      </h3>
      <div className="grid gap-6 md:grid-cols-2">{ptable(r.graha_spudam.slice(0, half))}{ptable(r.graha_spudam.slice(half))}</div>
      <div className="grid gap-6 md:grid-cols-2">
        <SouthChart cells={r.rasi_chart} title={L("ராசி", "Rasi")} lang={lang} />
        <SouthChart cells={r.navamsa_chart} title={L("நவாம்சம்", "Navamsam")} lang={lang} />
      </div>
      <div className="table-scroll"><table className="w-full table-fixed">
        <tbody>
          {bottom.map(([a, b]) => (
            <tr key={a}><td className="w-[44%] align-top"><DIcon label={a} />{a}</td><td className="w-[2%] text-center align-top">:</td><td className="align-top">{b}</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="text-center font-bold text-[#8e2b1c]">{L("சுபம்", "Subham")}</div>
      <div className="flex items-center justify-center gap-2 border-t pt-1 text-center text-[11px]" style={{ borderColor: "var(--jat-gold, #d4af37)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-transparent.png" alt="" className="h-7 w-auto" />MyLoginn Astrology
      </div>
    </div>
    </div>
  );
}

/* Palan sections 16–20 (reference TOC). Original text written for this
   website and composed for the chart by the backend (palan/compose.py). */
const MODULE_KEYS = ["general", "graha_spudam", "bhava_spudam", "dasa_bhukti", "antharam", "ashtakavarga",
  "sarvashtakavarga", "prasthara", "shadbala", "shodasa_varga", "planet_details", "numerology", "upagraha", "kalachakra", "panchapakshi"];

function palanOf(r: KalaiReportData, lang: Lang): KalaiPalan | undefined {
  return lang === "ta" ? r.palan_ta : r.palan_en ?? r.palan_ta;
}

function BhavaPalan({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const p = palanOf(r, lang);
  if (!p) return null;
  return (
    <div className="space-y-5 leading-relaxed">
      {p.bhava.map((h) => (
        <div key={h.house} className="pdf-keep space-y-1.5">
          <h3 className="text-base font-bold text-[#8e2b1c]">{h.title}</h3>
          {h.paragraphs.map((x, i) => <p key={i} className="text-justify">{x}</p>)}
        </div>
      ))}
    </div>
  );
}

function DasaPalan({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const p = palanOf(r, lang);
  if (!p) return null;
  return (
    <div className="space-y-6 leading-relaxed">
      {p.dasa.map((d) => (
        <div key={d.title} className="space-y-1.5">
          <h3 className="text-base font-bold text-[#8e2b1c]">{d.title}</h3>
          {d.paragraphs.map((x, i) => <p key={i} className="text-justify">{x}</p>)}
          <ul className="ml-5 list-disc space-y-1">
            {d.bhuktis.map((b, i) => <li key={i} className="pdf-keep">{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function GocharaPalan({ r, which, lang }: { r: KalaiReportData; which: "guru" | "sani"; lang: Lang }) {
  const p = palanOf(r, lang);
  if (!p) return null;
  return (
    <div className="space-y-5 leading-relaxed">
      {p.gochara[which].map((g, i) => (
        <div key={i} className="pdf-keep space-y-1.5">
          <h3 className="text-base font-bold text-[#8e2b1c]">{g.title}</h3>
          {g.paragraphs.map((x, k) => <p key={k} className="text-justify">{x}</p>)}
        </div>
      ))}
    </div>
  );
}

function YogaPalan({ r, lang }: { r: KalaiReportData; lang: Lang }) {
  const p = palanOf(r, lang);
  if (!p) return null;
  return (
    <div className="space-y-4 leading-relaxed">
      {p.yoga.map((y, i) => (
        <div key={i} className="pdf-keep">
          <h3 className="font-bold" style={{ color: y.kind === "avayoga" ? "#6f6049" : "var(--jat-accent, #8e2b1c)" }}>{y.name}</h3>
          <p className="text-justify">{y.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

export const KalaiReport: React.FC<{
  report: KalaiReportData; lang: Lang; mode?: "full" | "single" | "custom"; chartStyle?: ChartStyle; chart?: ChartResponse | null;
  /** custom: the section keys the user ticked (MODULE_KEYS + palan keys) */
  sections?: string[];
  /** paper of the normal PDF (A4 / A5) */
  paper?: PaperSize;
}> = ({ report: r, lang, mode = "full", chartStyle = "tamil", chart = null, sections, paper = "A4" }) => {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const allKeys = [...MODULE_KEYS, "bhava_palan", "dasa_palan", "guru_gochara", "sani_gochara", "yoga"];
  const selected = mode === "single" ? [] : mode === "custom" ? allKeys.filter((k) => (sections ?? allKeys).includes(k)) : allKeys;
  const lagnaSign = React.useMemo(() => {
    const e = Object.entries(r.rasi_chart).find(([, ps]) => ps.includes("Lagna"));
    return e ? Number(e[0]) : 1;
  }, [r.rasi_chart]);
  const toc = mode !== "single";
  const PALAN = [
    { no: 16, key: "bhava_palan", ta: "பாவக பலன்கள்", en: "Bhava Palan" },
    { no: 17, key: "dasa_palan", ta: "மகாதிசை பலன்கள்", en: "Mahadasa Palan" },
    { no: 18, key: "guru_gochara", ta: "குரு கோச்சார பலன்கள்", en: "Guru Gochara Palan" },
    { no: 19, key: "sani_gochara", ta: "சனி கோச்சார பலன்கள்", en: "Sani Gochara Palan" },
    { no: 20, key: "yoga", ta: "யோக அவயோகங்கள்", en: "Yogas and Avayogas" },
  ];
  const show = (key: string) => selected.includes(key);
  pageRefs.current = [];
  const reg = (el: HTMLDivElement | null) => {
    if (el && !pageRefs.current.includes(el)) pageRefs.current.push(el);
  };
  const status = (key: string) => r.sections.find((s) => s.key === key);
  const title = (key: string) => {
    const s = status(key)!;
    return <SectionTitle ta={`${s.no}. ${s.title_ta}`} en={`${s.no}. ${s.title_en}`} lang={lang} />;
  };
  const pendingPage = (key: string) => {
    const s = status(key)!;
    return (
      <Page pageRef={reg} key={key}>
        {title(key)}
        <Pending lang={lang} phase={s.phase} />
      </Page>
    );
  };
  const dasaGroups: KalaiDasha[][] = [];
  for (let i = 0; i < r.dashas.length; i += 3) dasaGroups.push(r.dashas.slice(i, i + 3));

  const handlePdf = async () => {
    try {
      setExporting(lang === "ta" ? "தயாராகிறது…" : "Preparing…");
      await waitForRenderReady();
      const nodes = pageRefs.current.filter(Boolean) as HTMLElement[];
      await exportNodesToPdf(nodes, `${safeFileName(String(r.general.name || "jathagam"))}-kalai-report.pdf`, {
        paper: mode === "single" ? "A4" : paper,
        onProgress: (done, total) => setExporting(`${done}/${total}`),
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <ChartCtx.Provider value={{ style: chartStyle, lagna: lagnaSign }}>
      <div className="flex justify-center">
        <button type="button" className="btn-hand jat-chrome rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft" onClick={handlePdf} disabled={!!exporting}>
          {exporting ?? `${lang === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"}${mode === "single" ? "" : ` (${paper})`}`}
        </button>
      </div>

      {/* Table of contents */}
      {toc && <Page pageRef={reg}>
        <SectionTitle ta="பொருளடக்கம்" en="Contents" lang={lang} />
        <ol className="mx-auto max-w-md space-y-1 text-sm">
          {r.sections.filter((s) => show(s.key)).map((s) => (
            <li key={s.key} className="flex justify-between border-b border-dotted" >
              <span><DIcon label={lang === "ta" ? s.title_ta : s.title_en} />{s.no}. {lang === "ta" ? s.title_ta : s.title_en}</span>
              {s.status !== "ok" && <span className="text-xs" style={{ color: "var(--jat-ink-soft, #6f6049)" }}>{s.phase}</span>}
            </li>
          ))}
          {(r.palan_ta || r.palan_en) && PALAN.filter((s) => show(s.key)).map((s) => (
            <li key={s.key} className="flex justify-between border-b border-dotted border-[#aa820a]/40">
              <span><DIcon label={lang === "ta" ? s.ta : s.en} />{s.no}. {lang === "ta" ? s.ta : s.en}</span>
            </li>
          ))}
        </ol>
      </Page>}

      {mode !== "single" && show("general") && chart?.bio_data && (
        <Page pageRef={reg}>
          <SectionTitle ta="சுய விவரம்" en="Bio Data" lang={lang} />
          {/* father / mother are printed in the general details: not repeated here */}
          <BioDataCard chart={chart} lang={lang} omitParentNames={!!(r.general.father_name || r.general.mother_name)} />
        </Page>
      )}

      {mode === "single" && (
        <Page pageRef={reg}>
          <SinglePage r={r} lang={lang} />
        </Page>
      )}

      {show("general") && <Page pageRef={reg}>{title("general")}<GeneralDetails r={r} lang={lang} /></Page>}
      {show("graha_spudam") && <Page pageRef={reg}>{title("graha_spudam")}<GrahaSpudam r={r} lang={lang} /></Page>}
      {show("bhava_spudam") && <Page pageRef={reg}>{title("bhava_spudam")}<BhavaSpudam r={r} lang={lang} /></Page>}

      {show("dasa_bhukti") && dasaGroups.map((grp, i) => (
        <Page pageRef={reg} key={`dasa-${i}`}>
          {i === 0 && title("dasa_bhukti")}
          {i === 0 && (
            <p className="text-center text-sm font-semibold">
              {lang === "ta" ? r.dasa_balance.kalai_ta ?? r.dasa_balance.formatted_ta : r.dasa_balance.formatted_en}
            </p>
          )}
          {i === 0 && (
            <p className="text-center text-xs">
              {lang === "ta" ? "கீழுள்ள அட்டவணைகள் தசா புக்தி காலங்களின் முடிவு தேதிகளைக் குறிக்கின்றன" : "Dates below are the END dates of each period"}
            </p>
          )}
          <DasaColumns dashas={grp} lang={lang} />
        </Page>
      ))}

      {show("antharam") && r.dashas.map((d, i) => (
        <Page pageRef={reg} key={`ant-${d.start_date}`}>
          {i === 0 && title("antharam")}
          <AntharamDasa d={d} lang={lang} />
        </Page>
      ))}

      {show("ashtakavarga") && Object.values(r.ashtakavarga.planets).map((p, i) => (
        <Page pageRef={reg} key={`av-${p.planet}`}>
          {i === 0 && title("ashtakavarga")}
          <AvPlanet p={p} lang={lang} />
        </Page>
      ))}

      {show("sarvashtakavarga") && <Page pageRef={reg}>{title("sarvashtakavarga")}<Sarva r={r} lang={lang} /></Page>}

      {show("prasthara") && r.prasthara?.status === "ok" && Object.values(r.prasthara.planets).map((p, i) => (
        <Page pageRef={reg} key={`pr-${p.planet}`}>{i === 0 && title("prasthara")}<Prasthara p={p} lang={lang} /></Page>
      ))}
      {show("shadbala") && <Page pageRef={reg}>{title("shadbala")}<Shadbala r={r} lang={lang} /></Page>}
      {show("shodasa_varga") && <Page pageRef={reg}>{title("shodasa_varga")}<ShodasaVarga r={r} lang={lang} /></Page>}
      {show("shodasa_varga") && <Page pageRef={reg}><ShodasaVargaTables r={r} lang={lang} /></Page>}
      {show("planet_details") && <Page pageRef={reg}>{title("planet_details")}<PlanetDetails r={r} lang={lang} /></Page>}
      {show("numerology") && <Page pageRef={reg}>{title("numerology")}<Numerology r={r} lang={lang} /></Page>}
      {show("upagraha") && <Page pageRef={reg}>{title("upagraha")}<Upagraha r={r} lang={lang} /></Page>}
      {!show("kalachakra") ? null : r.kalachakra?.status === "ok" && r.kalachakra.dashas
        ? r.kalachakra.dashas.map((d, i) => (
            <Page pageRef={reg} key={`kc-${i}`}>
              {i === 0 && title("kalachakra")}
              <Kalachakra d={d} first={i === 0} lang={lang} dirTa={r.kalachakra?.direction_ta ?? ""} dirEn={r.kalachakra?.direction === "savya" ? "Savya (clockwise)" : "Apasavya (anti-clockwise)"} />
            </Page>
          ))
        : pendingPage("kalachakra")}
      {show("panchapakshi") && (r.panchapakshi?.status === "ok" ? (
        <>
          <Page pageRef={reg}>{title("panchapakshi")}<PakshiHalf s={r.panchapakshi.shukla} lang={lang} /></Page>
          <Page pageRef={reg}><PakshiHalf s={r.panchapakshi.krishna} lang={lang} /></Page>
        </>
      ) : pendingPage("panchapakshi"))}
      {show("panchapakshi_detailed") && r.panchapakshi?.status === "ok" && (r.panchapakshi.detailed ?? []).map((p, i) => (
        <Page pageRef={reg} key={`pd-${i}`}>
          {i === 0 && title("panchapakshi_detailed")}
          <PakshiDetailedPage p={p} birth={r.panchapakshi!.birth_bird} lang={lang} />
        </Page>
      ))}
      {mode !== "single" && (r.palan_ta || r.palan_en) && (
        <>
          {show("bhava_palan") && <Page pageRef={reg}><SectionTitle ta="16. பாவக பலன்கள்" en="16. Bhava Palan" lang={lang} /><BhavaPalan r={r} lang={lang} /></Page>}
          {show("dasa_palan") && <Page pageRef={reg}><SectionTitle ta="17. மகாதிசை பலன்கள்" en="17. Mahadasa Palan" lang={lang} /><DasaPalan r={r} lang={lang} /></Page>}
          {show("guru_gochara") && <Page pageRef={reg}><SectionTitle ta="18. குரு கோச்சார பலன்கள்" en="18. Guru Gochara Palan" lang={lang} /><GocharaPalan r={r} which="guru" lang={lang} /></Page>}
          {show("sani_gochara") && <Page pageRef={reg}><SectionTitle ta="19. சனி கோச்சார பலன்கள்" en="19. Sani Gochara Palan" lang={lang} /><GocharaPalan r={r} which="sani" lang={lang} /></Page>}
          {show("yoga") && <Page pageRef={reg}><SectionTitle ta="20. யோக அவயோகங்கள்" en="20. Yogas and Avayogas" lang={lang} /><YogaPalan r={r} lang={lang} /></Page>}
        </>
      )}
      </ChartCtx.Provider>
    </div>
  );
};

export default KalaiReport;
