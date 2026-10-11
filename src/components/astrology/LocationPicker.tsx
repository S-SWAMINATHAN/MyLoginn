"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, ChevronDown, Check, Plus, Globe, Navigation, Loader2, X } from "lucide-react";
import { FloatingPanel } from "@/components/astrology/ui/FloatingPanel";
import { getGroupedLocationsApi, suggestPlacesApi, directGeocodeApi } from "@/lib/astrology/api";
import { GroupedLocations, LocationItem, PlaceSuggestion } from "@/lib/astrology/types";
import { tamilPlaceLabel } from "@/lib/astrology/tamilTransliterate";
import { rememberPlaceTa } from "@/lib/astrology/placeLabel";

interface LocationPickerProps {
  value: string;
  onChange: (placeName: string, lat?: number, lon?: number, timezone?: string) => void;
  lang: "ta" | "en";
  label?: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * ICON-OVERLAP FIX (the pin sitting on top of the "பிறந்த இடம்" label, and the
 * chevron floating above the field):
 *
 * The trigger button used to place its two icons with
 *     className="absolute left-3.5 top-3.5 …"
 * but the button itself was NOT a positioned element. `position: absolute`
 * resolves against the nearest *positioned* ancestor, which here was the
 * outer `<div className="relative">` — the wrapper that also contains the
 * <label>. So both icons were measured from the top of the whole field group,
 * i.e. from the label, not from the button, and landed on top of the label
 * text. It looked roughly right only when there was no label.
 *
 * The fix is to drop absolute positioning entirely: the button is a flex row
 * and the icons are ordinary flex children, so they can never escape it. Any
 * label/help text above or below now has no effect on where they sit.
 *
 * This component holds no default location of its own — whatever the caller
 * passes as `value` is what shows. Callers must start it empty on a fresh
 * page load.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  lang,
  label,
  required = true,
  placeholder = "e.g. Coimbatore, Tamil Nadu",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tamil_nadu" | "india" | "global">("tamil_nadu");
  const [groupedData, setGroupedData] = useState<GroupedLocations | null>(null);
  const [liveSuggestions, setLiveSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customPlace, setCustomPlace] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // ── Bug 1 / Bug 6: Tamil place names in Tamil mode ─────────────────────
  // DISPLAY ONLY. `onChange` still receives the exact same English
  // display_name + lat/lon/timezone as before, so geocoding and every
  // calculation are unchanged. (The value must stay English: the backend's
  // resolve_place() silently falls back to Coimbatore when it cannot
  // geocode a place string, so a Tamil string there could quietly produce a
  // chart for the wrong city whenever lat/lon were missing.)
  // Priority: curated Tamil name (backend KNOWN_LOCATIONS) -> phonetic
  // Tamil transliteration of the English name.
  const [taLabels, setTaLabels] = useState<Record<string, string>>({});
  // The Tamil shown here is also recorded for the reports and PDFs
  // (lib/placeLabel.ts), so they print exactly this name — not a fresh
  // letter-by-letter transliteration of the English value.
  const rememberTa = (english: string, ta: string) => {
    rememberPlaceTa(english, ta);
    setTaLabels((prev) => (prev[english] === ta ? prev : { ...prev, [english]: ta }));
  };

  const curatedTaFor = (english: string): string | undefined => {
    if (!groupedData || !english) return undefined;
    const lower = english.toLowerCase();
    const all = [...(groupedData.tamil_nadu || []), ...(groupedData.india || []), ...(groupedData.global || [])];
    const hit = all.find((it) => lower.startsWith(it.name.toLowerCase()));
    return hit?.name_ta;
  };

  const triggerTa = useMemo(() => {
    if (lang !== "ta" || !value) return "";
    return taLabels[value] || tamilPlaceLabel(value, curatedTaFor(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, value, taLabels, groupedData]);

  useEffect(() => {
    if (value && triggerTa) rememberPlaceTa(value, triggerTa);
  }, [value, triggerTa]);

  useEffect(() => {
    getGroupedLocationsApi()
      .then((data) => setGroupedData(data))
      .catch((err) => console.warn("Failed to load grouped locations:", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setLiveSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      suggestPlacesApi(search.trim())
        .then((res) => setLiveSuggestions(res || []))
        .catch(() => setLiveSuggestions([]))
        .finally(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectLocation = (loc: {
    display_name: string;
    display_name_ta?: string;
    name_ta?: string;
    lat: number;
    lon: number;
    timezone?: string;
  }) => {
    rememberTa(loc.display_name, tamilPlaceLabel(loc.display_name, loc.name_ta || loc.display_name_ta));
    onChange(loc.display_name, loc.lat, loc.lon, loc.timezone || "Asia/Kolkata");
    setIsOpen(false);
    setSearch("");
    setCustomMode(false);
  };

  const handleResolveAndApply = async (placeQuery: string) => {
    const query = (placeQuery || "").trim();
    if (!query) return;

    setIsResolving(true);
    try {
      const match = await directGeocodeApi(query);
      if (match) {
        rememberTa(match.display_name, tamilPlaceLabel(match.display_name, match.display_name_ta));
        onChange(match.display_name, match.lat, match.lon, match.timezone || "Asia/Kolkata");
      } else {
        onChange(query, undefined, undefined, "Asia/Kolkata");
      }
    } catch {
      onChange(query, undefined, undefined, "Asia/Kolkata");
    } finally {
      setIsResolving(false);
      setIsOpen(false);
      setSearch("");
      setCustomMode(false);
    }
  };

  const handleApplyCustom = () => {
    if (!customPlace.trim()) return;
    const lat = customLat ? parseFloat(customLat) : undefined;
    const lon = customLon ? parseFloat(customLon) : undefined;
    onChange(customPlace.trim(), lat, lon, "Asia/Kolkata");
    setIsOpen(false);
    setCustomMode(false);
  };

  const allLocations: LocationItem[] = groupedData
    ? [
        ...(activeTab === "all" || activeTab === "tamil_nadu" ? groupedData.tamil_nadu || [] : []),
        ...(activeTab === "all" || activeTab === "india" ? groupedData.india || [] : []),
        ...(activeTab === "all" || activeTab === "global" ? groupedData.global || [] : []),
      ]
    : [];

  const filteredItems = search
    ? allLocations.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.name_ta.includes(search) ||
          item.display_name.toLowerCase().includes(search.toLowerCase()) ||
          item.display_name_ta.includes(search)
      )
    : allLocations;

  // One flat, keyboard-navigable list: live (geocoder) hits first, then the curated places.
  type Row = {
    id: string;
    title: string;
    sub: string;
    meta: string;
    live: boolean;
    selected: boolean;
    pick: () => void;
  };
  const rows: Row[] = [
    ...liveSuggestions.map((item, idx): Row => ({
      id: `live-${idx}`,
      title: lang === "ta" ? tamilPlaceLabel(item.display_name, item.display_name_ta) : item.display_name,
      sub: lang === "ta" ? item.display_name : `${item.timezone}`,
      meta: `${item.lat.toFixed(2)}°, ${item.lon.toFixed(2)}°`,
      live: true,
      selected: false,
      pick: () => handleSelectLocation(item),
    })),
    ...filteredItems.map((loc): Row => ({
      id: loc.key,
      title: lang === "ta" ? loc.name_ta : loc.name,
      sub: `${lang === "ta" ? `${loc.name} · ` : ""}${loc.state ? `${loc.state}, ` : ""}${loc.country}`,
      meta: `${loc.lat.toFixed(2)}° N`,
      live: false,
      selected: !!value && value.toLowerCase().includes(loc.name.toLowerCase()),
      pick: () => handleSelectLocation(loc),
    })),
  ];

  useEffect(() => setActiveIdx(0), [search, activeTab, liveSuggestions]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const tabs = [
    ["tamil_nadu", lang === "ta" ? "தமிழ்நாடு" : "Tamil Nadu"],
    ["india", lang === "ta" ? "இந்தியா" : "India"],
    ["global", lang === "ta" ? "சர்வதேசம்" : "Global"],
    ["all", lang === "ta" ? "அனைத்தும்" : "All"],
  ] as const;

  const busy = isSearching || isResolving;
  // what the closed field shows: the chosen place, in the page language
  const shownValue = !value ? "" : lang === "ta" && triggerTa ? triggerTa : value;
  const q = search.trim();

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="field-label">
          {label} {required && <span className="text-brand-fg">*</span>}
        </label>
      )}

      {/* One field only: it shows the chosen place and doubles as the search box. */}
      <div
        className={`flex w-full items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground transition-all hover:border-brand-400/60 ${
          isOpen ? "border-brand-500 ring-2 ring-brand-500/20" : "border-line"
        }`}
      >
        <MapPin className="h-4 w-4 shrink-0 text-brand-fg" />
        <input
          ref={searchInputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
          value={isOpen ? search : shownValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!isOpen) setIsOpen(true);
              setActiveIdx((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              if (!isOpen) return;
              e.preventDefault();
              if (rows[activeIdx]) rows[activeIdx].pick();
              else if (q) handleResolveAndApply(search);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={isOpen && shownValue ? shownValue : placeholder}
          className={`min-w-0 flex-1 bg-transparent font-medium outline-none ${
            isOpen && shownValue ? "placeholder:text-foreground/70" : "placeholder:text-muted/70"
          }`}
        />
        {busy ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-fg" />
        ) : isOpen && search ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              searchInputRef.current?.focus();
            }}
            aria-label={lang === "ta" ? "அழி" : "Clear"}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => (isOpen ? setIsOpen(false) : searchInputRef.current?.focus())}
            aria-label={lang === "ta" ? "பட்டியல்" : "Toggle list"}
            className="shrink-0 text-muted"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {isOpen && (
        <FloatingPanel
          anchorRef={containerRef}
          width={460}
          matchAnchor
          label={lang === "ta" ? "இடத்தைத் தேர்வு செய்க" : "Choose place"}
          className="!overflow-hidden !p-0"
          onClose={() => setIsOpen(false)}
        >
          {/* Region filter (the search box is the field above) */}
          <div className="border-b border-border-soft bg-gradient-to-b from-brand-500/10 to-transparent px-3 py-2.5">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none" role="tablist">
              {tabs.map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveTab(key)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === key
                      ? "bg-brand-600 text-white shadow-md"
                      : "bg-surface-2 text-foreground/80 hover:bg-brand-500/10 hover:text-brand-fg"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[min(19rem,45dvh)] overflow-y-auto overscroll-contain p-2 scrollbar-thin" role="listbox">
            {!groupedData && !q && (
              <div className="space-y-2 p-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-2" />
                ))}
              </div>
            )}

            {rows.map((r, i) => {
              const showHead = r.live ? i === 0 : !rows[i - 1] || rows[i - 1].live;
              const active = i === activeIdx;
              return (
                <React.Fragment key={r.id}>
                  {showHead && (r.live || liveSuggestions.length > 0) && (
                    <div className="flex items-center gap-1.5 px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {r.live ? <Globe className="h-3 w-3 text-brand-fg" /> : <MapPin className="h-3 w-3" />}
                      {r.live
                        ? lang === "ta" ? "தேடல் முடிவுகள்" : "Search results"
                        : lang === "ta" ? "பிரபல இடங்கள்" : "Popular places"}
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={r.selected}
                    data-idx={i}
                    onClick={r.pick}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      r.selected ? "bg-brand-500/10" : active ? "bg-surface-2" : ""
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        r.selected || active ? "bg-brand-600 text-white" : "bg-brand-500/10 text-brand-fg"
                      }`}
                    >
                      {r.selected ? <Check className="h-4 w-4" /> : r.live ? <Navigation className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block break-words text-sm font-semibold leading-snug ${r.selected ? "text-brand-fg" : "text-foreground"}`}>{r.title}</span>
                      <span className="block break-words text-[11px] leading-snug text-muted">{r.sub}</span>
                    </span>
                    <span className="hidden shrink-0 font-mono text-[10px] text-muted/80 sm:block">{r.meta}</span>
                  </button>
                </React.Fragment>
              );
            })}

            {/* Nothing found: resolve the typed text directly */}
            {rows.length === 0 && !isSearching && q.length >= 2 && (
              <div className="space-y-3 px-4 py-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-fg">
                  <Globe className="h-6 w-6" />
                </span>
                <p className="text-xs text-muted">
                  {lang === "ta"
                    ? `"${search}" பட்டியலில் இல்லை. அட்ச தீர்க்க ரேகைகளை நேரடியாகக் கண்டறியலாம்.`
                    : `"${search}" isn't in the list. We can look up its coordinates directly.`}
                </p>
                <button
                  type="button"
                  onClick={() => handleResolveAndApply(search)}
                  disabled={isResolving}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs"
                >
                  {isResolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  {lang === "ta" ? `"${search}"-ஐப் பயன்படுத்து` : `Use "${search}"`}
                </button>
              </div>
            )}

            {rows.length === 0 && !q && groupedData && (
              <p className="px-4 py-8 text-center text-xs text-muted">
                {lang === "ta" ? "ஊர் பெயரை உள்ளிட்டுத் தேடுங்கள்" : "Type a place name to search"}
              </p>
            )}
          </div>

          {/* Footer: custom coordinates */}
          <div className="border-t border-border-soft bg-surface-2/60 p-3">
            {!customMode ? (
              <div className="flex items-center justify-between gap-3">
                <span className="hidden text-[11px] text-muted sm:block">
                  {lang === "ta" ? "↑↓ தேர்வு · Enter உறுதி" : "↑↓ to move · Enter to select"}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-fg transition hover:bg-brand-500/10 sm:w-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "ta" ? "அட்சரேகை / தீர்க்கரேகை உள்ளிடு" : "Enter exact coordinates"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-bold text-brand-fg">
                  {lang === "ta" ? "சுய ஊர் விவரம்" : "Custom location"}
                </div>
                <input
                  type="text"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder={lang === "ta" ? "ஊரின் பெயர்" : "Place name"}
                  className="field !py-2 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" value={customLat} onChange={(e) => setCustomLat(e.target.value)} placeholder="Latitude (9.51)" className="field !py-2 text-xs" />
                  <input type="number" step="any" value={customLon} onChange={(e) => setCustomLon(e.target.value)} placeholder="Longitude (77.63)" className="field !py-2 text-xs" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setCustomMode(false)} className="px-3 py-1.5 text-xs text-muted hover:text-foreground">
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                  <button type="button" onClick={handleApplyCustom} className="btn-primary px-4 py-1.5 text-xs">
                    {lang === "ta" ? "பயன்படுத்து" : "Apply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </FloatingPanel>
      )}
    </div>
  );
};

export default LocationPicker;
