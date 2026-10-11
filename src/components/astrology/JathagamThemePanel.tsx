"use client";

import React, { useState } from "react";
import { Palette, Type, RotateCcw, ChevronDown, Check, PaintBucket, Sparkles } from "lucide-react";
import {
  useJathagamTheme,
  JATHAGAM_PALETTES,
  PAGE_BACKGROUNDS,
  TAMIL_FONTS,
} from "@/lib/astrology/jathagamTheme";

interface Props {
  lang: "ta" | "en";
  /** Narrow single-column layout without the collapsible header (used in the viewer drawer). */
  compact?: boolean;
}

type Tab = "ink" | "background" | "font";
type Tone = "dark" | "light" | "kongu";

/**
 * The one panel that restyles the ENTIRE Jathagam — every section on the page,
 * the 50-page manuscript, the single-page sheet, the Rasi/Navamsa charts, and
 * therefore both PDFs, because the exporter rasterises this same themed DOM.
 *
 * Same handlers and theme context as before; only the layout changed: a live
 * preview on top, then one tab at a time (ink / background / typeface) instead
 * of three long grids stacked on each other.
 * Pages are always white-based, so palettes are previewed by their ink,
 * heading and rule colours (a white "paper" dot would be invisible).
 */
export const JathagamThemePanel: React.FC<Props> = ({ lang, compact = false }) => {
  const { palette, font, background, setPaletteId, setFontId, setBackgroundId, reset } = useJathagamTheme();
  const ta = lang === "ta";
  // swatch of the palette's OWN paper (palette.paper is already the chosen background)
  const ownPaper = JATHAGAM_PALETTES.find((p) => p.id === palette.id)?.paper ?? palette.paper;
  const paperColour = background.colour ?? ownPaper;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("ink");
  const [tone, setTone] = useState<Tone>((palette.tone as Tone) || "dark");

  const tones: [Tone, string][] = [
    ["dark", ta ? "பாரம்பரிய" : "Traditional"],
    ["light", ta ? "ஒளிர்" : "Bright"],
    ["kongu", ta ? "கொங்கு மண்டலம்" : "Kongu"],
  ];
  const tabs: [Tab, string, React.ReactNode][] = [
    ["ink", ta ? "மை வண்ணம்" : "Ink colour", <Palette key="i" className="h-4 w-4" />],
    ["background", ta ? "பின்னணி" : "Background", <PaintBucket key="b" className="h-4 w-4" />],
    ["font", ta ? "எழுத்துரு" : "Typeface", <Type key="f" className="h-4 w-4" />],
  ];

  const card = (active: boolean) =>
    `relative rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
      active ? "border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/25" : "border-line bg-surface hover:border-brand-400"
    }`;
  const tick = (
    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white shadow">
      <Check className="h-3 w-3" />
    </span>
  );

  return (
    <div className={compact ? "no-print" : "no-print card overflow-hidden"}>
      {/* Header */}
      {!compact && <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-b border-border-soft bg-gradient-to-r from-brand-500/10 via-transparent to-transparent px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="brand-gradient-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-soft">
            <Palette className="h-5 w-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground sm:text-base">
              {ta ? "ஜாதக வடிவமைப்பு" : "Jathagam design"}
            </span>
            <span className="block truncate text-[11px] text-muted sm:text-xs">
              {ta ? "மை வண்ணம் · பின்னணி · தமிழ் எழுத்துரு — முழு ஜாதகத்திற்கும் பொருந்தும்" : "Ink · background · Tamil typeface — applies to the whole horoscope"}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center -space-x-1.5 sm:flex" aria-hidden>
            {[palette.accent, palette.ink, palette.gold].map((c, i) => (
              <span key={i} className="h-5 w-5 rounded-full ring-2 ring-surface" style={{ background: c }} />
            ))}
          </span>
          <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>}

      {(open || compact) && (
        <div className={compact ? "grid gap-4 p-4" : "grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6"}>
          {/* Live preview */}
          <div className={compact ? "" : "lg:sticky lg:top-24 lg:self-start"}>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
              <Sparkles className="h-3.5 w-3.5 text-brand-fg" />
              {ta ? "நேரடி முன்னோட்டம்" : "Live preview"}
            </div>
            <div
              className="allow-own-font overflow-hidden rounded-2xl border border-line p-4 shadow-inner transition-colors"
              style={{ background: paperColour, fontFamily: font.stack, fontWeight: font.weight }}
            >
              <div className="text-lg leading-tight" style={{ color: palette.accent }}>
                {ta ? "ஜன்ம ஜாதகம்" : "Janma Jathagam"}
              </div>
              <div className="my-2 h-px" style={{ background: palette.gold }} />
              <div className="text-[13px] leading-relaxed" style={{ color: palette.ink }}>
                {ta ? "பெயர்: குருபிரசாத் · நட்சத்திரம்: அசுவினி · லக்னம்: மேஷம்" : "Name: Guruprasath · Star: Ashwini · Lagna: Mesha"}
              </div>
              <div className="mt-2 inline-block rounded-md px-2 py-0.5 text-[11px]" style={{ background: palette.gold, color: "#fff" }}>
                {ta ? "ராசி 123" : "Rasi 123"}
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              {ta ? font.labelTa : font.labelEn} · {ta ? palette.labelTa : palette.labelEn}
            </p>
            <button type="button" onClick={reset} className="btn-secondary mt-3 w-full text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              {ta ? "இயல்பு நிலைக்கு" : "Reset to default"}
            </button>
          </div>

          {/* Controls */}
          <div className="min-w-0">
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1" role="tablist">
              {tabs.map(([id, text, icon]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    tab === id ? "bg-surface text-brand-fg shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  {icon}
                  <span className="truncate">{text}</span>
                </button>
              ))}
            </div>

            {tab === "ink" && (
              <div>
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {tones.map(([t, text]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        tone === t ? "bg-brand-600 text-white shadow-md" : "bg-surface-2 text-foreground/80 hover:bg-brand-500/10"
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <div className={compact ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4"}>
                  {JATHAGAM_PALETTES.filter((p) => (p.tone || "dark") === tone).map((p) => {
                    const active = p.id === palette.id;
                    return (
                      <button key={p.id} type="button" onClick={() => setPaletteId(p.id)} aria-pressed={active} className={card(active)}>
                        <span className="mb-2 flex h-9 overflow-hidden rounded-lg ring-1 ring-black/10">
                          {(
                            [
                              [p.accent, ta ? "தலைப்பு" : "Heading"],
                              [p.ink, ta ? "உரை" : "Body"],
                              [p.gold, ta ? "சிறப்பு" : "Highlight"],
                            ] as [string, string][]
                          ).map(([c, label]) => (
                            <span key={label} title={label} className="flex-1" style={{ background: c }} />
                          ))}
                        </span>
                        <span className="block text-xs font-semibold leading-tight text-foreground">{ta ? p.labelTa : p.labelEn}</span>
                        {active && tick}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  {ta ? "வண்ணப் பட்டை: தலைப்பு · உரை · சிறப்பு" : "Colour bar: heading · body · highlight"}
                </p>
              </div>
            )}

            {tab === "background" && (
              <div className={compact ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 gap-2.5 sm:grid-cols-3"}>
                {PAGE_BACKGROUNDS.map((b) => {
                  const active = b.id === background.id;
                  return (
                    <button key={b.id} type="button" onClick={() => setBackgroundId(b.id)} aria-pressed={active} className={`${card(active)} flex items-center gap-3`}>
                      <span className="h-12 w-12 shrink-0 rounded-xl shadow-inner ring-1 ring-black/15" style={{ background: b.colour ?? ownPaper }} aria-hidden />
                      <span className="min-w-0 flex-1 pr-5 text-xs font-semibold leading-snug text-foreground">{ta ? b.labelTa : b.labelEn}</span>
                      {active && tick}
                    </button>
                  );
                })}
                <p className={`text-[11px] text-muted ${compact ? "" : "sm:col-span-3"}`}>
                  {ta ? "பக்கம் · PDF · அச்சு PDF மூன்றிலும் பொருந்தும்" : "Applies to the page, the PDF and the print PDF"}
                </p>
              </div>
            )}

            {tab === "font" && (
              <div className={compact ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3"}>
                {TAMIL_FONTS.map((f) => {
                  const active = f.id === font.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontId(f.id)}
                      aria-pressed={active}
                      title={f.noteTa}
                      className={`allow-own-font ${card(active)}`}
                      style={{ fontFamily: f.stack, fontWeight: f.weight }}
                    >
                      <span className="block pr-6 text-lg leading-snug text-foreground">ஜாதகம் 123</span>
                      <span className="mt-0.5 block text-[11px] leading-tight text-muted">{ta ? f.labelTa : f.labelEn}</span>
                      {active && tick}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mt-5 border-t border-border-soft pt-3 text-[11px] leading-relaxed text-muted">
              {ta
                ? "தேர்வு செய்த வண்ணம், பின்னணி, எழுத்துரு திரையில் தெரியும் முழு ஜாதகத்திற்கும் உடனே பொருந்தும். அதே தோற்றமே சாதாரண PDF-லும் அச்சு PDF-லும் வரும்."
                : "The colour, background and typeface you pick apply immediately to the whole report on screen. The normal PDF and the print PDF match what you see."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JathagamThemePanel;
