"use client";

// Kalai Magal "Utilities" menu (Phase 3c): Tamil → English date,
// Udhayathi Naligai → Standard Time, Tamil date of any day.
import { usePersistentLang } from "@/lib/astrology/useLang";
import React, { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Header } from "@/components/astrology/Header";
import { Footer } from "@/components/astrology/Footer";
import { LocationPicker } from "@/components/astrology/LocationPicker";
import { TimeInput12h } from "@/components/astrology/TimeInput12h";
import { PageHero } from "@/components/astrology/ui/PageHero";
import { DateInput } from "@/components/astrology/ui/DateInput";
import {
  getTamilCalendarNames, naligaiToTimeApi, pariviruthiLabel, tamilDateApi, tamilToEnglishApi,
  type TamilCalendarNames,
} from "@/lib/astrology/kalaiApi";

type Lang = "ta" | "en";
const inputCls = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-foreground focus:border-brand-400 focus:outline-none";
const border = {};

function Card({ title, children, z }: { title: string; children: React.ReactNode; z: number }) {
  return (
    <section className="story-panel relative space-y-4 rounded-3xl p-5 sm:p-6" style={{ overflow: "visible", zIndex: z }}>
      <h2 className="text-lg font-bold text-brand-fg">{title}</h2>
      {children}
    </section>
  );
}

function Place({ lat, lon, tz, setLat, setLon, setTz, lang }: {
  lat: number; lon: number; tz: string; setLat: (v: number) => void; setLon: (v: number) => void; setTz: (v: string) => void; lang: Lang;
}) {
  const [name, setName] = useState("");
  return (
    <div className="space-y-1">
      <LocationPicker value={name} lang={lang} label={lang === "ta" ? "இடம்" : "Place"}
        onChange={(n, la, lo, z) => { setName(n); if (la != null) setLat(la); if (lo != null) setLon(lo); if (z) setTz(z); }} />
      <p className="text-xs text-muted">{lat.toFixed(4)} / {lon.toFixed(4)} / {tz}</p>
    </div>
  );
}

export default function KalaiUtilitiesPage() {
  const [lang, setLang] = usePersistentLang();
  const [names, setNames] = useState<TamilCalendarNames | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Tamil → English
  const [tDay, setTDay] = useState(1);
  const [tMonth, setTMonth] = useState(1);
  const [tYear, setTYear] = useState(40);
  const [tCycle, setTCycle] = useState(26);
  const [tOut, setTOut] = useState<string | null>(null);

  // Naligai → time
  const [nDate, setNDate] = useState(new Date().toISOString().slice(0, 10));
  const [nN, setNN] = useState(0);
  const [nV, setNV] = useState(0);
  const [nT, setNT] = useState(0);
  const [lat, setLat] = useState(11.0);
  const [lon, setLon] = useState(77.0);
  const [tz, setTz] = useState("Asia/Kolkata");
  const [nOut, setNOut] = useState<{ time: string; sunrise: string; sunset: string } | null>(null);

  // Tamil date of a day
  const [dDate, setDDate] = useState(new Date().toISOString().slice(0, 10));
  const [dTime, setDTime] = useState("12:00:00");
  const [dOut, setDOut] = useState<string | null>(null);

  useEffect(() => {
    getTamilCalendarNames().then(setNames).catch((e) => setErr(String(e)));
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const months = names ? (lang === "ta" ? names.months_ta : names.months_en) : [];
  const years = names ? (lang === "ta" ? names.years_ta : names.years_en) : [];

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <PageHero
          icon={<Wrench className="h-7 w-7" />}
          eyebrow="Kalai Magal parity · Utilities"
          title={lang === "ta" ? "ஜோதிட" : "Astro"}
          highlight={lang === "ta" ? "கருவிகள்" : "Utilities"}
          tagline={lang === "ta" ? "— கலைமகள் பயன்பாட்டு பட்டியல் —" : "— the Kalai Magal Utilities menu —"}
        />
        {err && <p className="text-center text-sm">{err}</p>}

        <Card z={30} title={lang === "ta" ? "தமிழ் தேதி → ஆங்கிலத் தேதி" : "Tamil Date → English Date"}>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <label>{lang === "ta" ? "தேதி" : "Day"}
              <select className={inputCls} style={border} value={tDay} onChange={(e) => setTDay(Number(e.target.value))}>
                {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>{lang === "ta" ? "மாதம்" : "Month"}
              <select className={inputCls} style={border} value={tMonth} onChange={(e) => setTMonth(Number(e.target.value))}>
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>
            <label>{lang === "ta" ? "வருடம்" : "Year"}
              <select className={inputCls} style={border} value={tYear} onChange={(e) => setTYear(Number(e.target.value))}>
                {years.map((y, i) => <option key={y} value={i + 1}>{i + 1}. {y}</option>)}
              </select>
            </label>
            <label>{lang === "ta" ? "பரிவிருத்தி எண்" : "Pariviruthi No"}
              <select className={inputCls} style={border} value={tCycle} onChange={(e) => setTCycle(Number(e.target.value))}>
                {Array.from({ length: 42 }, (_, i) => i + 1).map((k) => <option key={k} value={k}>{pariviruthiLabel(k)}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft" onClick={() => run(async () => {
              const r = await tamilToEnglishApi({ day: tDay, month: tMonth, year_index: tYear, pariviruthi: tCycle });
              setTOut(r.display);
            })}>{lang === "ta" ? "மாற்று" : "Convert"}</button>
            {tOut && <span className="font-mono text-lg">{tOut}</span>}
          </div>
        </Card>

        <Card z={20} title={lang === "ta" ? "உதயாதி நாழிகை → நேரம்" : "Udhayathi Naligai → Standard Time"}>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
            <label>{lang === "ta" ? "தேதி" : "Date"}
              <DateInput  className={inputCls} style={border} value={nDate} onChange={(e) => setNDate(e.target.value)} />
            </label>
            <label>{lang === "ta" ? "நாழிகை" : "Nazhigai"}
              <input type="number" min={0} max={60} className={inputCls} style={border} value={nN} onChange={(e) => setNN(Number(e.target.value))} />
            </label>
            <label>{lang === "ta" ? "விநாழிகை" : "Vinazhigai"}
              <input type="number" min={0} max={59} className={inputCls} style={border} value={nV} onChange={(e) => setNV(Number(e.target.value))} />
            </label>
            <label>{lang === "ta" ? "தற்பரை" : "Tharparai"}
              <input type="number" min={0} max={59} className={inputCls} style={border} value={nT} onChange={(e) => setNT(Number(e.target.value))} />
            </label>
          </div>
          <Place lat={lat} lon={lon} tz={tz} setLat={setLat} setLon={setLon} setTz={setTz} lang={lang} />
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft" onClick={() => run(async () => {
              setNOut(await naligaiToTimeApi({ date: nDate, nazhigai: nN, vinazhigai: nV, tharparai: nT, latitude: lat, longitude: lon, timezone: tz }));
            })}>{lang === "ta" ? "கணி" : "Compute"}</button>
            {nOut && (
              <span className="font-mono text-sm">
                {lang === "ta" ? "நேரம்" : "Time"}: <b>{nOut.time}</b> · {lang === "ta" ? "உதயம்" : "Sunrise"} {nOut.sunrise} · {lang === "ta" ? "அஸ்தமனம்" : "Sunset"} {nOut.sunset}
              </span>
            )}
          </div>
        </Card>

        <Card z={10} title={lang === "ta" ? "ஆங்கிலத் தேதி → தமிழ் தேதி" : "English Date → Tamil Date"}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label>{lang === "ta" ? "தேதி" : "Date"}
              <DateInput  className={inputCls} style={border} value={dDate} onChange={(e) => setDDate(e.target.value)} />
            </label>
            <label>{lang === "ta" ? "நேரம்" : "Time"}
              <TimeInput12h value={dTime} onChange={setDTime} />
            </label>
          </div>
          <Place lat={lat} lon={lon} tz={tz} setLat={setLat} setLon={setLon} setTz={setTz} lang={lang} />
          <div className="flex items-center gap-4">
            <button type="button" className="rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft" onClick={() => run(async () => {
              const r = await tamilDateApi({ date: dDate, time: dTime, latitude: lat, longitude: lon, timezone: tz });
              setDOut(lang === "ta" ? r.formatted_ta : r.formatted_en);
            })}>{lang === "ta" ? "கணி" : "Compute"}</button>
            {dOut && <span className="text-lg">{dOut}</span>}
          </div>
        </Card>
      </main>
      <Footer lang={lang} note={lang === "ta" ? "கலைமகள் பயன்பாடுகள்" : "Kalai Magal utilities"} />
    </div>
  );
}
