"use client";

// Kalai Magal parity — Marriage matching, 12 poruthams with graded points (Phase 5).
import { usePersistentLang } from "@/lib/astrology/useLang";
import React, { useRef, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Header } from "@/components/astrology/Header";
import { Footer } from "@/components/astrology/Footer";
import { JathagamThemePanel } from "@/components/astrology/JathagamThemePanel";
import { DIcon } from "@/lib/astrology/detailIcons";
import { JathagamThemeProvider, THEME_SCOPE_CLASS } from "@/lib/astrology/jathagamTheme";

import { PageHero } from "@/components/astrology/ui/PageHero";
import { kalaiMatchingApi, type KalaiMatchResult, type MatchPersonIn, type MatchPersonOut } from "@/lib/astrology/kalaiApi";
import { exportNodesToPdf, safeFileName, waitForRenderReady } from "@/lib/astrology/pdfExport";
import { LocationPicker } from "@/components/astrology/LocationPicker";
import { toTamil } from "@/lib/astrology/tamilTransliterate";
import { TamilNameInput } from "@/components/astrology/TamilNameInput";
import { placeForLang } from "@/lib/astrology/placeLabel";
import { to12h, toDdMmYyyy } from "@/lib/astrology/timeFormat";
import { TimeInput12h } from "@/components/astrology/TimeInput12h";
import { KalaiChart, ChartStyleSwitch } from "@/components/astrology/kalai/KalaiChart";
import type { ChartStyle } from "@/lib/astrology/chartLayouts";
import { PrintPdfControls } from "@/components/astrology/kalai/PrintPdfControls";
import { DateInput } from "@/components/astrology/ui/DateInput";
import { ReportWatermark } from "@/components/astrology/ReportWatermark";
import { poruthamKey } from "@/lib/astrology/access";

const DOC = `${THEME_SCOPE_CLASS} jathagam-legacy`;
type Lang = "ta" | "en";
const inp = "w-full rounded border px-2 py-1 text-sm bg-transparent";
const bd = { borderColor: "var(--jat-gold-40, #d9c8a0)" };
const SOUTH: (number | null)[] = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];
const SH: Record<string, string> = { Sun: "சூரி", Moon: "சந்", Mars: "செவ்", Mercury: "புத", Jupiter: "குரு", Venus: "சுக்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Lagna: "லக்" };
const SEVVAI_TA: Record<string, string> = { none: "தோஷம் இல்லை", parihara: "பரிகார செவ்வாய்", dosham: "செவ்வாய் தோஷம்" };

function Chart({ cells, title, style, lang }: { cells: Record<string, string[]>; title: string; style: ChartStyle; lang: Lang }) {
  return <KalaiChart cells={cells} title={title} style={style} lang={lang} />;
}

const field = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-foreground focus:border-brand-400 focus:outline-none";

function PersonForm({ label, v, set, lang }: { label: string; v: MatchPersonIn; set: (p: MatchPersonIn) => void; lang: Lang }) {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-xl font-bold text-brand-fg">{label}</h3>
      <label className="block space-y-1 text-sm font-medium">{lang === "ta" ? "பெயர்" : "Name"}
        {/* Thanglish → Tamil suggestions in a dropdown, same as the birth-details form */}
        <TamilNameInput hideIcon lang={lang} value={v.name} onChange={(t) => set({ ...v, name: t })} className={field}
          placeholder={lang === "ta" ? "தமிழில் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்" : "Type in Tamil or English"} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm font-medium">{lang === "ta" ? "பிறந்த தேதி" : "Date of birth"}
          <DateInput  className={field} value={v.date_of_birth} onChange={(e) => set({ ...v, date_of_birth: e.target.value })} />
        </label>
        <div className="space-y-1 text-sm font-medium">{lang === "ta" ? "பிறந்த நேரம்" : "Time of birth"}
          <TimeInput12h value={v.time_of_birth || "12:00:00"} onChange={(tm) => set({ ...v, time_of_birth: tm })} />
        </div>
      </div>
      <LocationPicker value={v.place ?? ""} lang={lang} label={lang === "ta" ? "பிறந்த ஊர்" : "Place of birth"}
        onChange={(name, lat, lon, tz) => set({ ...v, place: name, latitude: lat ?? v.latitude, longitude: lon ?? v.longitude, timezone: tz ?? v.timezone })} />
      {v.place && <p className="text-xs text-muted">{v.latitude.toFixed(4)} / {v.longitude.toFixed(4)} / {v.timezone}</p>}
    </div>
  );
}

function PersonCard({ p, who, lang, style }: { p: MatchPersonOut; who: string; lang: Lang; style: ChartStyle }) {
  const g = p.general;
  const ta = lang === "ta";
  // one label column and one value column, so every value lines up under the heading (bug 7)
  const rows: [string, string][] = [
    [ta ? "பிறந்த தேதி" : "Date of birth", toDdMmYyyy(String(g.date_of_birth))],
    [ta ? "பிறந்த நேரம்" : "Time of birth", to12h(String(g.time_of_birth))],
    [ta ? "நேர மண்டலம்" : "Time zone", String(g.timezone ?? "")],
    [ta ? "நட்சத்திரம்" : "Star", `${String(ta ? g.janma_nakshatra_ta : g.janma_nakshatra_en ?? g.janma_nakshatra_ta)} ${ta ? "பாதம்" : "pada"} ${String(g.pada)}`],
    [ta ? "ராசி" : "Rasi", String(ta ? g.janma_rasi_ta : g.janma_rasi_en ?? g.janma_rasi_ta)],
    [ta ? "லக்னம்" : "Lagna", String(ta ? g.lagna_ta : g.lagna_en ?? g.lagna_ta)],
    [ta ? "தமிழ் தேதி" : "Tamil date", String(g.tamil_date_ta ?? "")],
    [ta ? "திதி" : "Tithi", String(g.thithi_ta ?? "")],
    [ta ? "அயனாம்சம்" : "Ayanamsa", String(g.ayanamsa_dms ?? "")],
    [ta ? "பாவக மாற்றம்" : "Bhava change", p.bhava_moves.length ? p.bhava_moves.map((m) => `${m.planet_ta}(${m.bhava_sign_ta})`).join(" ") : (ta ? "மாற்றம் இல்லை" : "none")],
    [ta ? "ஜனன கால தசை இருப்பு" : "Dasa balance", String(ta ? p.dasa_balance.kalai_ta ?? p.dasa_balance.formatted_ta : p.dasa_balance.formatted_en)],
  ];
  if (p.current_dasa_bhukti) {
    rows.push([ta ? "நடப்பு தசா புக்தி முடிவு" : "Current dasa-bhukti ends",
      `${p.current_dasa_bhukti.dasa_ta} ${ta ? "தசா" : "dasa"} ${p.current_dasa_bhukti.bhukti_ta} ${ta ? "புக்தி" : "bhukti"} ${p.current_dasa_bhukti.end}`]);
  }
  return (
    <div className="space-y-3 rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--jat-gold-40, #d9c8a0)" }}>
      <div className="text-base font-bold" style={{ color: "var(--jat-accent, #8e2b1c)" }}>{who}: {ta ? toTamil(String(g.name ?? "")) : String(g.name ?? "")}</div>
      <div className="table-scroll"><table className="w-full">
        <tbody>
          {rows.filter(([, v]) => v && v !== "undefined").map(([k, v]) => (
            <tr key={k} className="border-b border-dotted" style={{ borderColor: "var(--jat-gold-40, #d9c8a0)" }}>
              <td className="w-[42%] py-1 pr-3 align-top font-semibold"><DIcon label={String(k)} />{k}</td>
              <td className="py-1 align-top">{v}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="grid justify-items-center gap-4 sm:grid-cols-2">
        <Chart cells={p.rasi_chart} title={ta ? "ராசி" : "Rasi"} style={style} lang={lang} />
        <Chart cells={p.navamsa_chart} title={ta ? "நவாம்சம்" : "Navamsa"} style={style} lang={lang} />
      </div>
    </div>
  );
}

const blank = (name: string): MatchPersonIn => ({ name, date_of_birth: "", time_of_birth: "12:00:00", place: "", latitude: 11.0, longitude: 77.0, timezone: "Asia/Kolkata" });

export default function KalaiMatchingPage() {
  const [lang, setLang] = usePersistentLang();
  const [girl, setGirl] = useState<MatchPersonIn>(blank(""));
  const [boy, setBoy] = useState<MatchPersonIn>(blank(""));
  const [res, setRes] = useState<KalaiMatchResult | null>(null);
  // the partners as they were when the result was generated (editing the form later must not change what is unlocked)
  const [shown, setShown] = useState<{ girl: MatchPersonIn; boy: MatchPersonIn } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("tamil");
  const pageRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    setBusy(true); setErr(null); setRes(null);
    try {
      const g = { ...girl, place: placeForLang(girl.place, lang) }, b = { ...boy, place: placeForLang(boy.place, lang) };
      setRes(await kalaiMatchingApi(g, b)); setShown({ girl: g, boy: b });
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  const pdf = async () => {
    if (!pageRef.current) return;
    await waitForRenderReady();
    await exportNodesToPdf([pageRef.current], `${safeFileName(`${girl.name}-${boy.name}`)}-porutham.pdf`);
  };
  const ok = (b: boolean) => (lang === "ta" ? (b ? "பொருத்தம் உண்டு" : "பொருத்தம் இல்லை") : (b ? "Matching" : "Not matching"));

  return (
    <JathagamThemeProvider>
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <PageHero icon={<HeartHandshake className="h-7 w-7" />} eyebrow="Kalai Magal parity · Matching"
          title={lang === "ta" ? "திருமணப்" : "Marriage"} highlight={lang === "ta" ? "பொருத்தம்" : "Matching"}
          tagline={lang === "ta" ? "— 12 பொருத்தங்கள், புள்ளிகளுடன் —" : "— 12 poruthams with points —"} />
        <section className="no-print card w-full p-6 sm:p-8 shadow-sm text-foreground">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="text-brand-500">✦</span>{lang === "ta" ? "மணமக்கள் விவரங்கள்" : "Bride & Groom Details"}
          </h2>
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:divide-x lg:divide-line">
            <div className="lg:pr-8">
          <PersonForm label={lang === "ta" ? "பெண்" : "Girl"} v={girl} set={setGirl} lang={lang} />
          </div>
            <div className="lg:pl-8"><PersonForm label={lang === "ta" ? "ஆண்" : "Boy"} v={boy} set={setBoy} lang={lang} />
        </div>
          </div>
        </section>
        <div className="flex justify-center gap-3">
          <button type="button" className="rounded-xl brand-gradient-bg px-10 py-3.5 text-base font-semibold text-white shadow-soft disabled:opacity-60" onClick={run} disabled={busy || !girl.date_of_birth || !boy.date_of_birth || !girl.place || !boy.place}>{busy ? "…" : (lang === "ta" ? "பொருத்தம் பார்" : "Match")}</button>
          {res && <button type="button" className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground" onClick={pdf}>{lang === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"}</button>}
        </div>
        {err && <p className="text-center text-sm" style={{ color: "var(--jat-accent, #8e2b1c)" }}>{err}</p>}
        {res && (
          <div className="space-y-4">
            <div className="no-print flex justify-center"><ChartStyleSwitch value={chartStyle} onChange={setChartStyle} lang={lang} /></div>
            <PrintPdfControls path="porutham" lang={lang} ready={!!shown}
              filename={`porutham-${shown?.girl.name || "girl"}-${shown?.boy.name || "boy"}.pdf`}
              body={{ girl: shown?.girl ?? {}, boy: shown?.boy ?? {}, chart_style: chartStyle === "north_indian" ? "north" : "south" }} />
          </div>
        )}
        {res && shown && (
          <ReportWatermark access={{ product: "MATCHING", reportKey: poruthamKey(shown.girl, shown.boy) }}>
          <div ref={pageRef} className={`${DOC} kalai-page story-panel mx-auto w-full space-y-5 rounded-3xl p-6 sm:p-8`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <PersonCard p={res.girl} who={lang === "ta" ? "செல்வி" : "Girl"} lang={lang} style={chartStyle} />
              <PersonCard p={res.boy} who={lang === "ta" ? "செல்வன்" : "Boy"} lang={lang} style={chartStyle} />
            </div>
            <div className="w-full"><div className="table-scroll"><table className="table-hand w-full text-center text-xs">
              <thead><tr><th className="text-left">{lang === "ta" ? "பொருத்தம்" : "Porutham"}</th><th>{lang === "ta" ? "பெண்" : "Girl"}</th><th>{lang === "ta" ? "ஆண்" : "Boy"}</th><th>{lang === "ta" ? "பொருத்தம்" : "Result"}</th><th>{lang === "ta" ? "புள்ளி" : "Points"}</th></tr></thead>
              <tbody>{res.poruthams.rows.map((r) => (
                <tr key={r.key}><td className="text-left">{r.no}. {r.name_ta}{!r.verified && <sup title="classical rule, not yet seen in a Kalai sample">*</sup>}</td>
                  <td>{r.girl}</td><td>{r.boy}</td><td>{r.verdict_ta}</td><td className="font-mono">{r.points}/{r.max}</td></tr>))}
                <tr className="font-bold"><td className="text-left" colSpan={4}>{lang === "ta" ? "நட்சத்திரப் பொருத்தம்" : "Star match"}: {res.poruthams.percent} % — {res.poruthams.star_match_ta}</td><td className="font-mono">{res.poruthams.total}/{res.poruthams.max}</td></tr>
              </tbody></table></div></div>
            <div className="table-scroll"><table className="table-hand w-full text-sm"><tbody>
              <tr><td className="font-semibold"><DIcon label="செவ்வாய் தோஷம்" />{lang === "ta" ? "செவ்வாய் தோஷம்" : "Sevvai dosham"}</td><td>{SEVVAI_TA[res.sevvai.girl]} ({lang === "ta" ? "பெண்" : "girl"}) · {SEVVAI_TA[res.sevvai.boy]} ({lang === "ta" ? "ஆண்" : "boy"})</td><td>{ok(res.sevvai.match)}</td></tr>
              <tr><td className="font-semibold"><DIcon label="ரச்சுப் பொருத்தம்" />{lang === "ta" ? "ரச்சுப் பொருத்தம்" : "Rajju"}</td><td>{res.rajju.exists ? (lang === "ta" ? "உண்டு" : "yes") : (lang === "ta" ? "இல்லை" : "no")}</td><td>{ok(res.rajju.match)}</td></tr>
              <tr><td className="font-semibold"><DIcon label="தசா சந்தி" />{lang === "ta" ? "தசா சந்தி" : "Dasa sandhi"}</td>
                <td>{res.dasa_sandhi.sandhi ? `${lang === "ta" ? "உண்டு" : "yes"} — ${lang === "ta" ? "பெண்" : "girl"} ${res.dasa_sandhi.girl?.dasa_ta} (${res.dasa_sandhi.girl?.end}), ${lang === "ta" ? "ஆண்" : "boy"} ${res.dasa_sandhi.boy?.dasa_ta} (${res.dasa_sandhi.boy?.end})` : (lang === "ta" ? "இல்லை" : "no")}</td>
                <td>{ok(res.dasa_sandhi.match)}</td></tr>
            </tbody></table></div>
            {!res.poruthams.all_rows_verified && <p className="text-xs" style={{ color: "var(--jat-ink-soft, #6f6049)" }}>* {lang === "ta" ? "இந்த வரிசை பாரம்பரிய விதிப்படி கணிக்கப்பட்டது; கலைமகள் மாதிரியுடன் இன்னும் ஒப்பிடப்படவில்லை." : "Computed by the classical rule; not yet compared with a Kalai sample."}</p>}
          </div>
          </ReportWatermark>
        )}
      </main>
      <Footer lang={lang} note={lang === "ta" ? "திருமணப் பொருத்தம்" : "Marriage matching"} />
    </div>
    </JathagamThemeProvider>
  );
}
