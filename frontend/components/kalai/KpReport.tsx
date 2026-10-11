"use client";

// KP (Krishnamurti Paddhati) report — Kalai Magal parity (Phase 4).
// Renders only backend values (/api/kalai/kp). Section order follows Kalai's
// KP Type A / KP All reports.
import React, { useRef, useState } from "react";
import type { KpReport as KpData } from "@/lib/kalaiApi";
import { toTamil } from "@/lib/tamilTransliterate";
import { to12h } from "@/lib/timeFormat";
import { BioDataCard } from "@/components/BioDataCard";
import type { ChartResponse } from "@/lib/types";
import { exportNodesToPdf, safeFileName, waitForRenderReady, type PaperSize } from "@/lib/pdfExport";
import { ayanamsaTa, timeTa, tzTa } from "@/lib/taText";
import { DIcon } from "@/lib/detailIcons";
import { CELL_BG, centreBackground, lagnaMarkCss } from "@/lib/chartArt";
import { useJathagamTheme } from "@/lib/jathagamTheme";

type Lang = "ta" | "en";
const TA: Record<string, string> = {
  Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்", Jupiter: "குரு", Venus: "சுக்கிரன்",
  Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Uranus: "யுரேனஸ்", Neptune: "நெப்டியூன்", Fortuna: "அதிஷ்டப்பாகை", Lagna: "லக்னம்",
};
const SHORT_TA: Record<string, string> = {
  Sun: "சூரி", Moon: "சந்", Mars: "செவ்", Mercury: "புத", Jupiter: "குரு", Venus: "சுக்", Saturn: "சனி",
  Rahu: "ராகு", Ketu: "கேது", Uranus: "யுரே", Neptune: "நெப்", Fortuna: "அ. பா", Lagna: "லக்",
};
const nm = (p: string, lang: Lang) => (lang === "ta" ? TA[p] ?? p : p);
const sh = (p: string, lang: Lang) => (lang === "ta" ? SHORT_TA[p] ?? p : p.slice(0, 3));
const SOUTH: (number | null)[] = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];

const MODULES = [
  ["general", "பொது விவரங்கள்", "General Details"],
  ["planets", "கிரக அட்டவணை", "Planet Table"],
  ["cusps", "பாவ அட்டவணை", "Cusp Table"],
  ["chart", "பாவம் (கிருஷ்ண மூர்த்தி பத்ததி)", "KP Chart"],
  ["significators", "பொது குறிப்பினர்கள்", "Significators"],
  ["aspects", "கிரக - பாவ பார்வைகள்", "Graha-Bhava / Graha-Graha Aspects"],
  ["dasa", "தசா புக்தி", "Dasa Bhukti"],
  ["antharam", "அந்தரம்", "Antharam"],
] as const;
const KP_TYPE_A = ["general", "planets", "cusps", "chart", "significators", "aspects", "dasa"];
const KP_ALL = MODULES.map((m) => m[0] as string);

function Page({ children, reg }: { children: React.ReactNode; reg: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={reg} className="kalai-page story-panel mx-auto w-full space-y-4 rounded-3xl p-6 sm:p-8">
      {children}
    </div>
  );
}
function Title({ t }: { t: string }) {
  return <h2 className="text-center text-xl font-bold" style={{ color: "var(--jat-accent, #8e2b1c)" }}><DIcon label={t} />{t}</h2>;
}

export const KpReport: React.FC<{
  report: KpData; lang: Lang; model?: "type_a" | "all" | "custom"; chart?: ChartResponse | null;
  /** custom: the section keys the user ticked */
  sections?: string[];
  /** paper of the normal PDF (A4 / A5) */
  paper?: PaperSize;
}> = ({ report: r, lang, model = "all", chart = null, sections, paper = "A4" }) => {
  const refs = useRef<HTMLDivElement[]>([]);
  refs.current = [];
  const reg = (el: HTMLDivElement | null) => { if (el && !refs.current.includes(el)) refs.current.push(el); };
  const sel = model === "type_a" ? KP_TYPE_A : model === "custom" ? KP_ALL.filter((k) => (sections ?? KP_ALL).includes(k)) : KP_ALL;
  const [busy, setBusy] = useState<string | null>(null);
  const show = (k: string) => sel.includes(k);
  const title = (k: string) => { const m = MODULES.find((x) => x[0] === k)!; return lang === "ta" ? m[1] : m[2]; };
  const g = r.general;

  const pdf = async () => {
    try {
      setBusy("…");
      await waitForRenderReady();
      await exportNodesToPdf(refs.current, `${safeFileName(String(g.name || "kp"))}-kp.pdf`, { paper, onProgress: (d, t) => setBusy(`${d}/${t}`) });
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const cells: Record<number, string[]> = {};
  r.kp_chart.cusps.forEach((c) => (cells[c.sign] = [...(cells[c.sign] || []), `${c.roman} ${c.deg}`]));
  r.kp_chart.planets.filter((p) => p.planet !== "Lagna").forEach((p) =>
    (cells[p.sign] = [...(cells[p.sign] || []), `${sh(p.planet, lang)} ${p.deg}`]));

  const lagnaSignKp = r.kp_chart.cusps.find((c) => c.roman === "I")?.sign;
  const accent = useJathagamTheme().palette.accent;
  const rows11 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune"];
  const lordCols = lang === "ta" ? ["ராசி அதிபதி", "நட்சத்திர அதிபதி", "உபநட்சத்திர அதிபதி", "உ.உ.நட்சத்திர அதிபதி"] : ["Sign lord", "Star lord", "Sub lord", "Sub-sub lord"];

  return (
    <div className="space-y-6">

      <div className="flex justify-center">
        <button type="button" className="btn-hand jat-chrome rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft" onClick={pdf} disabled={!!busy}>{busy ?? `${lang === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"} (${paper})`}</button>
      </div>

      {show("general") && (
        <Page reg={reg}>
          <Title t={title("general")} />
          <div className="table-scroll"><table className="table-hand mx-auto w-full max-w-3xl text-sm"><tbody>
            {[["பெயர்", "Name", lang === "ta" && g.name ? toTamil(String(g.name)) : g.name], ...(g.horary_number ? [["பிரசன்ன எண்", "Horary number", g.horary_number]] : []), ["பிறந்த தேதி", "Date of Birth", g.date_of_birth], ["பிறந்த நேரம்", "Time of Birth", lang === "ta" ? timeTa(to12h(String(g.time_of_birth ?? ""))) : to12h(String(g.time_of_birth ?? ""))],
              ["பிறந்த ஊர்", "Place", g.place], ["அட்சாம்சம் / தீர்க்காம்சம்", "Latitude / Longitude", `${g.latitude} / ${g.longitude}`],
              ["நேர மண்டலம்", "Time zone", lang === "ta" ? tzTa(String(g.timezone ?? "")) : g.timezone],
              ["அயனாம்சம்", "Ayanamsa", `${r.ayanamsa_dms} (${lang === "ta" ? ayanamsaTa(r.ayanamsa_name) : r.ayanamsa_name})`],
              ["தசை இருப்பு", "Dasa balance", lang === "ta" ? r.dasa_balance.formatted_ta : r.dasa_balance.formatted_en]]
              .map(([ta, en, v]) => <tr key={String(en)}><td className="w-[42%] py-1 pr-2 align-top font-semibold"><DIcon label={String(lang === "ta" ? ta : en)} />{lang === "ta" ? ta : en}</td><td>: {String(v ?? "")}</td></tr>)}
          </tbody></table></div>
        </Page>
      )}

      {chart?.bio_data && show("general") && (
        <Page reg={reg}>
          <Title t={lang === "ta" ? "சுய விவரம்" : "Bio Data"} />
          <BioDataCard chart={chart} lang={lang} />
        </Page>
      )}

      {show("planets") && (
        <Page reg={reg}>
          <Title t={title("planets")} />
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-xs">
            <thead><tr><th className="text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th><th>{lang === "ta" ? "பா க வி" : "D M S"}</th>{lordCols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{r.planets.map((p) => (
              <tr key={p.planet}><td className="text-left">{nm(p.planet, lang)}{p.retrograde ? (lang === "ta" ? " (வ)" : " (R)") : ""}</td>
                <td className="font-mono">{p.dms}</td><td>{nm(p.sign, lang)}</td><td>{nm(p.star, lang)}</td><td>{nm(p.sub, lang)}</td><td>{nm(p.subsub, lang)}</td></tr>))}
            </tbody></table></div></div>
        </Page>
      )}

      {show("cusps") && (
        <Page reg={reg}>
          <Title t={title("cusps")} />
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-xs">
            <thead><tr><th className="text-left">{lang === "ta" ? "பாவம்" : "Cusp"}</th><th>{lang === "ta" ? "பா க வி" : "D M S"}</th>{lordCols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{r.cusps.map((c) => (
              <tr key={c.roman}><td className="text-left">{c.roman}</td><td className="font-mono">{c.dms}</td>
                <td>{nm(c.sign, lang)}</td><td>{nm(c.star, lang)}</td><td>{nm(c.sub, lang)}</td><td>{nm(c.subsub, lang)}</td></tr>))}
            </tbody></table></div></div>
        </Page>
      )}

      {show("chart") && (
        <Page reg={reg}>
          <Title t={title("chart")} />
          {/* same artwork as every other chart (lib/chartArt); lines and text follow the panel; exact square */}
          <div className="mx-auto grid aspect-square w-full max-w-[640px] grid-cols-4 grid-rows-4"
            style={{ border: "2px solid var(--jat-accent, #8e2b1c)" }}>
            {SOUTH.map((s, i) => s === null ? (i === 5 ? <div key={i} className="flex min-h-0 items-center justify-center text-base font-bold"
              style={{ gridColumn: "2 / span 2", gridRow: "2 / span 2", color: "var(--jat-accent, #8e2b1c)", border: "1px solid var(--jat-accent, #8e2b1c)", ...centreBackground() }}>KP</div> : null) : (
              <div key={i} className="flex min-h-0 flex-col items-center justify-center overflow-hidden p-0.5 text-center text-[11px] font-bold leading-snug"
                style={{ background: s === lagnaSignKp ? `${lagnaMarkCss(22, accent)}, ${CELL_BG}` : CELL_BG, border: "1px solid var(--jat-accent, #8e2b1c)", color: "var(--jat-ink, #2b2117)" }}>
                {(cells[s] || []).map((x) => <span key={x} style={/^[IVX]+ /.test(x) ? { color: "var(--jat-accent, #8e2b1c)" } : undefined}>{x}</span>)}
              </div>))}
          </div>
        </Page>
      )}

      {show("significators") && (
        <Page reg={reg}>
          <Title t={title("significators")} />
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-xs">
            <thead><tr><th>{lang === "ta" ? "பாவம்" : "Bhava"}</th>
              <th>{lang === "ta" ? "பாவத்திலுள்ள கிரக நட்சத்திரத்தில் உள்ள கிரகங்கள்" : "In star of occupants"}</th>
              <th>{lang === "ta" ? "பாவத்திலுள்ள கிரகங்கள்" : "Occupants"}</th>
              <th>{lang === "ta" ? "பாவஅதிபதியின் நட்சத்திரத்தில் உள்ள கிரகங்கள்" : "In star of lord"}</th>
              <th>{lang === "ta" ? "பாவஅதிபதி" : "Lord"}</th></tr></thead>
            <tbody>{r.bhava_significators.map((b) => (
              <tr key={b.roman}><td>{b.roman}</td><td>{b.in_star_of_occupants.map((p) => nm(p, lang)).join(" ")}</td>
                <td>{b.occupants.map((p) => nm(p, lang)).join(" ")}</td><td>{b.in_star_of_lord.map((p) => nm(p, lang)).join(" ")}</td><td>{nm(b.lord, lang)}</td></tr>))}
            </tbody></table></div></div>
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-xs">
            <thead><tr><th className="text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th><th>{lang === "ta" ? "நட்சத்திரப்படி" : "By star"}</th>
              <th>{lang === "ta" ? "உபநட்சத்திரப்படி" : "By sub"}</th><th>{lang === "ta" ? "பார்க்கும் கிரகங்கள்" : "Aspected by"}</th></tr></thead>
            <tbody>{r.planet_significators.map((s) => (
              <tr key={s.planet}><td className="text-left">{nm(s.planet, lang)}</td><td>{s.by_star.join(", ")}</td><td>{s.by_sub.join(", ")}</td>
                <td>{s.aspected_by.map((p) => nm(p, lang)).join(" ")}</td></tr>))}
            </tbody></table></div></div>
        </Page>
      )}

      {show("aspects") && (
        <Page reg={reg}>
          <Title t={title("aspects")} />
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-[10px]">
            <thead><tr><th />{["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows11.map((p) => <tr key={p}><td className="text-left">{nm(p, lang)}</td>{r.bhava_aspects[p].map((v, i) => <td key={i} className="font-mono">{v}</td>)}</tr>)}</tbody>
          </table></div></div>
          <p className="text-center text-sm font-semibold">{lang === "ta" ? "கிரக - கிரக பார்வைகள்" : "Graha - Graha aspects"}</p>
          <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-[10px]">
            <thead><tr><th />{rows11.map((q) => <th key={q}>{sh(q, lang)}</th>)}</tr></thead>
            <tbody>{rows11.map((p) => <tr key={p}><td className="text-left">{nm(p, lang)}</td>{rows11.map((q) => <td key={q} className="font-mono">{r.planet_aspects[p][q]}</td>)}</tr>)}</tbody>
          </table></div></div>
        </Page>
      )}

      {show("dasa") && (
        <Page reg={reg}>
          <Title t={title("dasa")} />
          <p className="text-center text-sm">{lang === "ta" ? r.dasa_balance.formatted_ta : r.dasa_balance.formatted_en}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.dashas.map((d) => (
              <div key={d.start_date} className="pdf-keep rounded border p-2 text-xs" style={{ borderColor: "var(--jat-ink-soft, #6f6049)" }}>
                <div className="font-bold" style={{ color: "var(--jat-accent, #8e2b1c)" }}>{nm(d.planet, lang)} {lang === "ta" ? "தசா" : "Dasa"} {d.lord_years}</div>
                <div>{d.start_date_display} → {d.end_date_display}</div>
                <div className="mt-1 grid grid-cols-[1fr_5.5rem_1.6rem_1.6rem_1.6rem] gap-x-1 font-semibold">
                  <span>{lang === "ta" ? "புக்தி" : "Bhukti"}</span><span>{lang === "ta" ? "முடிவு" : "Ends"}</span>
                  <span className="text-right">{lang === "ta" ? "வ" : "Y"}</span><span className="text-right">{lang === "ta" ? "மா" : "M"}</span><span className="text-right">{lang === "ta" ? "நா" : "D"}</span>
                </div>
                {d.bhuktis.map((b) => (
                  <div key={b.end_date} className="grid grid-cols-[1fr_5.5rem_1.6rem_1.6rem_1.6rem] gap-x-1 font-mono" style={b.is_current ? { color: "var(--jat-accent, #8e2b1c)", fontWeight: 700 } : undefined}>
                    <span>{sh(b.planet, lang)}</span><span>{b.end_date_display}</span>
                    <span className="text-right">{b.age_ymd[0]}</span><span className="text-right">{b.age_ymd[1]}</span><span className="text-right">{b.age_ymd[2]}</span>
                  </div>))}
              </div>))}
          </div>
        </Page>
      )}

      {show("antharam") && r.dashas.map((d, i) => (
        <Page reg={reg} key={`a-${d.start_date}`}>
          {i === 0 && <Title t={title("antharam")} />}
          <div className="text-center font-bold">{nm(d.planet, lang)} {lang === "ta" ? "தசா" : "Dasa"}</div>
          <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 lg:grid-cols-3">
            {d.bhuktis.map((b) => (
              <div key={b.end_date} className="rounded border p-1.5 text-[11px]" style={{ borderColor: "var(--jat-gold-40, #d9c8a0)" }}>
                <div className="font-semibold">{nm(b.planet, lang)} {lang === "ta" ? "புக்தி" : "Bhukti"}</div>
                {b.antardashas.map((a) => <div key={a.end_date + a.planet} className="flex justify-between font-mono"><span>{sh(a.planet, lang)}</span><span>{a.end_date_display}</span></div>)}
              </div>))}
          </div>
        </Page>
      ))}
    </div>
  );
};

export default KpReport;
