"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, ChevronDown, Check, Plus, Globe, Navigation, Loader2 } from "lucide-react";
import { getGroupedLocationsApi, suggestPlacesApi, directGeocodeApi } from "@/lib/api";
import { GroupedLocations, LocationItem, PlaceSuggestion } from "@/lib/types";

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

  useEffect(() => {
    getGroupedLocationsApi()
      .then((data) => setGroupedData(data))
      .catch((err) => console.warn("Failed to load grouped locations:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    lat: number;
    lon: number;
    timezone?: string;
  }) => {
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

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-[#6f6049] mb-1.5 font-tamil">
          {label} {required && <span className="text-[#b03726]">*</span>}
        </label>
      )}

      {/* Trigger — flex row, NO absolutely-positioned icons (see note above) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#fbf7ee] border-2 border-[#a3917a]/60 hover:border-[#b03726] rounded-xl text-left text-sm text-[#2b2117] focus:outline-none focus:ring-2 focus:ring-[#b03726]/30 transition-all shadow-sm"
      >
        <MapPin className="w-4 h-4 shrink-0 text-[#b03726]" />
        <span
          className={`flex-1 min-w-0 truncate font-tamil font-medium ${
            value ? "text-[#2b2117]" : "text-[#a3917a]"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#6f6049] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#fdfaf2] border-2 border-[#8e2b1c]/50 rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-[#2b2117]">
          {/* Search header */}
          <div className="p-3 border-b border-[#a3917a]/30 bg-[#f7efdc] space-y-2">
            <div className="flex items-center gap-2 bg-[#fffcf5] border border-[#a3917a]/70 rounded-xl px-2.5 py-1.5 focus-within:border-[#b03726]">
              {isSearching || isResolving ? (
                <Loader2 className="w-4 h-4 shrink-0 text-[#b03726] animate-spin" />
              ) : (
                <Search className="w-4 h-4 shrink-0 text-[#8e2b1c]" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (liveSuggestions.length > 0) handleSelectLocation(liveSuggestions[0]);
                    else if (filteredItems.length > 0) handleSelectLocation(filteredItems[0]);
                    else if (search.trim()) handleResolveAndApply(search);
                  }
                }}
                placeholder={
                  lang === "ta"
                    ? "எந்த ஊரையும் தேடுக... (எ.கா. தென்காசி, Srivilliputhur, லண்டன்)"
                    : "Search any village, town, city worldwide (e.g. Tenkasi, London)..."
                }
                className="flex-1 min-w-0 bg-transparent text-[#2b2117] text-xs placeholder-[#6f6049]/60 outline-none"
              />
              {search.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => handleResolveAndApply(search)}
                  disabled={isResolving}
                  className="shrink-0 px-2.5 py-1 bg-[#b03726] hover:bg-[#8e2b1c] text-white text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  {isResolving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>{lang === "ta" ? "தேடு" : "Search"}</span>
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px] font-tamil scrollbar-none">
              {(
                [
                  ["tamil_nadu", lang === "ta" ? "தமிழ்நாடு" : "Tamil Nadu"],
                  ["india", lang === "ta" ? "இந்திய நகரங்கள்" : "Indian Cities"],
                  ["global", lang === "ta" ? "சர்வதேசம்" : "Global"],
                  ["all", lang === "ta" ? "அனைத்தும்" : "All"],
                ] as const
              ).map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as any)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                    activeTab === key
                      ? "bg-[#b03726] text-[#fffcf5] shadow-xs"
                      : "bg-[#eee2c7] text-[#2b2117]/80 hover:bg-[#e6d6b6]"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {search && search.trim().length >= 2 && (
            <div className="bg-[#f2e5cb] px-3.5 py-2 border-b border-[#a3917a]/30 flex items-center justify-between gap-2">
              <div className="text-xs text-[#2b2117] font-tamil truncate flex items-center gap-1.5 min-w-0">
                <Globe className="w-3.5 h-3.5 text-[#b03726] shrink-0" />
                <span className="truncate">
                  {lang === "ta" ? "தேடும் ஊர்: " : "Searching: "}
                  <strong className="text-[#8e2b1c] font-bold">&quot;{search}&quot;</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleResolveAndApply(search)}
                disabled={isResolving}
                className="px-2.5 py-1 bg-[#b03726] hover:bg-[#8e2b1c] text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors shrink-0 shadow-xs"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{lang === "ta" ? "கணிக்கிறது..." : "Resolving..."}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span>{lang === "ta" ? "இவ்வூரைத் தேர்ந்தெடு" : "Select this place"}</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto divide-y divide-[#a3917a]/20 scrollbar-thin">
            {liveSuggestions.length > 0 && (
              <div className="bg-[#fbf4e2]">
                <div className="px-3 py-1.5 text-[10px] text-[#8e2b1c] uppercase font-bold tracking-wider bg-[#f3e7ce] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#b03726]" />
                    {lang === "ta"
                      ? "நேரடி தேடல் முடிவுகள் (Open Geocoding API)"
                      : "Live Dynamic Results (Open Geocoding API)"}
                  </span>
                  <span className="font-mono font-normal text-[9px] text-[#6f6049]">
                    {liveSuggestions.length}
                  </span>
                </div>
                {liveSuggestions.map((item, idx) => (
                  <div
                    key={`live-${idx}`}
                    onClick={() => handleSelectLocation(item)}
                    className="px-4 py-2.5 text-xs text-[#2b2117] hover:bg-[#ecdcc2] cursor-pointer flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Navigation className="w-3.5 h-3.5 text-[#b03726] shrink-0" />
                      <div className="min-w-0">
                        <div className="font-tamil font-bold text-sm text-[#1e0f08] truncate">
                          {item.display_name}
                        </div>
                        <div className="text-[10.5px] text-[#6f6049] flex items-center gap-2 mt-0.5">
                          <span>{item.timezone}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {item.lat.toFixed(4)}°, {item.lon.toFixed(4)}°
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#b03726]/10 text-[#8e2b1c] text-[10px] font-bold rounded shrink-0">
                      {lang === "ta" ? "தேர்ந்தெடு" : "Select"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredItems.map((loc) => {
              const isSelected = !!value && value.toLowerCase().includes(loc.name.toLowerCase());
              return (
                <div
                  key={loc.key}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-4 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 hover:bg-[#ecdcc2] transition-colors ${
                    isSelected ? "bg-[#e8d7bb] text-[#8e2b1c] font-bold" : "text-[#2b2117]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#8e2b1c]" : "text-[#a3917a]"}`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold font-tamil truncate">
                        {lang === "ta" ? loc.name_ta : loc.name}
                        {lang === "ta" && (
                          <span className="text-[#6f6049] text-[10px] ml-1.5 font-sans font-normal">
                            ({loc.name})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6f6049] truncate">
                        {loc.state ? `${loc.state}, ` : ""}
                        {loc.country}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#8e2b1c] shrink-0" />
                  ) : (
                    <span className="text-[10px] text-[#a3917a] font-mono shrink-0">
                      {loc.lat.toFixed(2)}° N
                    </span>
                  )}
                </div>
              );
            })}

            {filteredItems.length === 0 &&
              liveSuggestions.length === 0 &&
              !isSearching &&
              search.trim().length >= 2 && (
                <div className="p-6 text-center text-xs text-[#6f6049] font-tamil space-y-2.5">
                  <Globe className="w-8 h-8 text-[#b03726]/60 mx-auto" />
                  <div>
                    {lang === "ta"
                      ? `"${search}" என்ற ஊரின் அட்ச தீர்க்க ரேகைகளை Geocoding API மூலம் கண்டறியலாம்.`
                      : `Resolve coordinates for "${search}" via Open Geocoding API.`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolveAndApply(search)}
                    disabled={isResolving}
                    className="px-4 py-2 bg-[#b03726] hover:bg-[#8e2b1c] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Resolving coordinates..."}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>
                          {lang === "ta" ? `"${search}"-ஐ நேரடியாகப் பயன்படுத்து` : `Use "${search}"`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
          </div>

          <div className="p-3 bg-[#f7efdc] border-t border-[#a3917a]/30 flex flex-col gap-2">
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="text-[11px] text-[#8e2b1c] hover:underline font-tamil flex items-center justify-center gap-1 w-full py-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                {lang === "ta"
                  ? "துல்லிய அட்சரேகை (Custom Lat/Lon) நேரடியாக உள்ளிட"
                  : "Enter custom town with exact coordinates"}
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-[#8e2b1c] font-tamil">
                  {lang === "ta" ? "சுய ஊர் விவரம் (Custom Coordinates)" : "Custom Location Coordinates"}
                </div>
                <input
                  type="text"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder={
                    lang === "ta" ? "ஊரின் பெயர் (e.g. Srivilliputhur / Tenkasi)" : "Place name"
                  }
                  className="w-full px-3 py-1.5 bg-[#fffcf5] border border-[#a3917a]/70 rounded-lg text-xs text-[#2b2117] outline-none focus:border-[#b03726]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude (e.g. 9.51)"
                    className="w-full px-2.5 py-1 bg-[#fffcf5] border border-[#a3917a]/70 rounded-lg text-[11px] text-[#2b2117] outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="Longitude (e.g. 77.63)"
                    className="w-full px-2.5 py-1 bg-[#fffcf5] border border-[#a3917a]/70 rounded-lg text-[11px] text-[#2b2117] outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="px-3 py-1 text-[10px] text-[#6f6049] hover:text-[#2b2117]"
                  >
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustom}
                    className="px-4 py-1 bg-[#b03726] text-white rounded-lg text-xs font-bold hover:bg-[#8e2b1c]"
                  >
                    {lang === "ta" ? "பயன்படுத்து" : "Apply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;