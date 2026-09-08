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

  // Load grouped locations once on mount for quick selection
  useEffect(() => {
    getGroupedLocationsApi()
      .then((data) => setGroupedData(data))
      .catch((err) => console.warn("Failed to load grouped locations:", err));
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Fetch live suggestions when typing search query using the free dynamic geocoding API
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setLiveSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      suggestPlacesApi(search.trim())
        .then((res) => {
          setLiveSuggestions(res || []);
        })
        .catch(() => setLiveSuggestions([]))
        .finally(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectLocation = (loc: { display_name: string; lat: number; lon: number; timezone?: string }) => {
    onChange(loc.display_name, loc.lat, loc.lon, loc.timezone || "Asia/Kolkata");
    setIsOpen(false);
    setSearch("");
    setCustomMode(false);
  };

  // Dynamically resolve any typed query using the Geocoding API (Zero hardcoding)
  const handleResolveAndApply = async (placeQuery: string) => {
    const query = (placeQuery || "").trim();
    if (!query) return;

    setIsResolving(true);
    try {
      const match = await directGeocodeApi(query);
      if (match) {
        onChange(match.display_name, match.lat, match.lon, match.timezone || "Asia/Kolkata");
      } else {
        // If not matched immediately, pass the query so backend can also resolve
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

  // Compile quick-select items based on active tab and search
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
        <label className="block text-sm font-semibold text-[#4a5578] mb-1.5 font-tamil">
          {label} {required && <span className="text-[#2454c7]">*</span>}
        </label>
      )}

      {/* Trigger Button - Parchment Style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-10 py-2.5 bg-[#fbfdff] border-2 border-[#8b93b5]/60 hover:border-[#2454c7] rounded-xl text-left text-sm text-[#161b33] focus:outline-none focus:ring-2 focus:ring-[#2454c7]/30 transition-all flex items-center justify-between shadow-sm"
      >
        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#2454c7]" />
        <span className={`truncate font-tamil font-medium ${value ? "text-[#161b33]" : "text-[#8b93b5]"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3.5 top-3.5 w-4 h-4 text-[#4a5578] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#ffffff] border-2 border-[#17348f]/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-fade-in max-w-lg w-full text-[#161b33]">
          {/* Header Search with Live API indicator */}
          <div className="p-3 border-b border-[#8b93b5]/30 bg-[#e7eefb] space-y-2">
            <div className="relative">
              {isSearching || isResolving ? (
                <Loader2 className="absolute left-3 top-2.5 w-4 h-4 text-[#2454c7] animate-spin" />
              ) : (
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#17348f]" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (liveSuggestions.length > 0) {
                      handleSelectLocation(liveSuggestions[0]);
                    } else if (filteredItems.length > 0) {
                      handleSelectLocation(filteredItems[0]);
                    } else if (search.trim()) {
                      handleResolveAndApply(search);
                    }
                  }
                }}
                placeholder={
                  lang === "ta"
                    ? "எந்த ஊரையும் தேடுக... (எ.கா. தென்காசி, Srivilliputhur, லண்டன்)"
                    : "Search any village, town, city worldwide (e.g. Tenkasi, London)..."
                }
                className="w-full pl-9 pr-20 py-2 bg-[#fbfdff] border border-[#8b93b5]/70 rounded-xl text-[#161b33] text-xs placeholder-[#4a5578]/60 outline-none focus:border-[#2454c7] focus:ring-1 focus:ring-[#2454c7]/40"
              />
              {search.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => handleResolveAndApply(search)}
                  disabled={isResolving}
                  className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-[#2454c7] hover:bg-[#17348f] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  {isResolving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>{lang === "ta" ? "தேடு" : "Search"}</span>
                  )}
                </button>
              )}
            </div>

            {/* Category Tabs for fast 1-click popular locations */}
            <div className="flex gap-1 overflow-x-auto text-[11px] font-tamil scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("tamil_nadu")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "tamil_nadu"
                    ? "bg-[#2454c7] text-[#fbfdff] shadow-xs"
                    : "bg-[#e7eefb] text-[#161b33]/80 hover:bg-[#d7e3f7]"
                }`}
              >
                {lang === "ta" ? "தமிழ்நாடு" : "Tamil Nadu"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("india")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "india"
                    ? "bg-[#2454c7] text-[#fbfdff] shadow-xs"
                    : "bg-[#e7eefb] text-[#161b33]/80 hover:bg-[#d7e3f7]"
                }`}
              >
                {lang === "ta" ? "இந்திய நகரங்கள்" : "Indian Cities"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("global")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "global"
                    ? "bg-[#2454c7] text-[#fbfdff] shadow-xs"
                    : "bg-[#e7eefb] text-[#161b33]/80 hover:bg-[#d7e3f7]"
                }`}
              >
                {lang === "ta" ? "சர்வதேசம்" : "Global"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-[#2454c7] text-[#fbfdff] shadow-xs"
                    : "bg-[#e7eefb] text-[#161b33]/80 hover:bg-[#d7e3f7]"
                }`}
              >
                {lang === "ta" ? "அனைத்தும்" : "All"}
              </button>
            </div>
          </div>

          {/* Dynamic Geocoding Resolution Bar */}
          {search && search.trim().length >= 2 && (
            <div className="bg-[#e7eefb] px-3.5 py-2 border-b border-[#8b93b5]/30 flex items-center justify-between">
              <div className="text-xs text-[#161b33] font-tamil truncate flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2454c7] shrink-0" />
                <span>
                  {lang === "ta" ? "தேடும் ஊர்: " : "Searching: "}
                  <strong className="text-[#17348f] font-bold">"{search}"</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleResolveAndApply(search)}
                disabled={isResolving}
                className="px-2.5 py-1 bg-[#2454c7] hover:bg-[#17348f] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
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

          {/* Location Results List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[#8b93b5]/20 scrollbar-thin">
            {/* 1. Live Dynamic Suggestions from Free Geocoding API (Open-Meteo & Nominatim) */}
            {liveSuggestions.length > 0 && (
              <div className="bg-[#fbfdff]">
                <div className="px-3 py-1.5 text-[10px] text-[#17348f] uppercase font-bold tracking-wider bg-[#e7eefb] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#2454c7]" />
                    {lang === "ta"
                      ? "நேரடி தேடல் முடிவுகள் (Open Geocoding API)"
                      : "Live Dynamic Results (Open Geocoding API)"}
                  </span>
                  <span className="font-mono font-normal text-[9px] text-[#4a5578]">
                    {liveSuggestions.length} இடங்கள்
                  </span>
                </div>
                {liveSuggestions.map((item, idx) => (
                  <div
                    key={`live-${idx}`}
                    onClick={() => handleSelectLocation(item)}
                    className="px-4 py-2.5 text-xs text-[#161b33] hover:bg-[#e7eefb] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Navigation className="w-3.5 h-3.5 text-[#2454c7] shrink-0" />
                      <div>
                        <div className="font-tamil font-bold text-sm text-[#11162e]">
                          {item.display_name}
                        </div>
                        <div className="text-[10.5px] text-[#4a5578] flex items-center gap-2 mt-0.5">
                          <span>{item.timezone}</span>
                          <span>•</span>
                          <span className="font-mono">{item.lat.toFixed(4)}°, {item.lon.toFixed(4)}°</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#2454c7]/10 text-[#17348f] text-[10px] font-bold rounded shrink-0 ml-2">
                      தேர்ந்தெடு
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Quick Popular Matching Locations */}
            {filteredItems.map((loc) => {
              const isSelected = value.toLowerCase().includes(loc.name.toLowerCase());
              return (
                <div
                  key={loc.key}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-4 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-[#e7eefb] transition-colors ${
                    isSelected ? "bg-[#dbe6f9] text-[#17348f] font-bold" : "text-[#161b33]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#17348f]" : "text-[#8b93b5]"}`} />
                    <div>
                      <div className="font-bold font-tamil">
                        {lang === "ta" ? loc.name_ta : loc.name}
                        {lang === "ta" && <span className="text-[#4a5578] text-[10px] ml-1.5 font-sans font-normal">({loc.name})</span>}
                      </div>
                      <div className="text-[10px] text-[#4a5578]">
                        {loc.state ? `${loc.state}, ` : ""}{loc.country}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#17348f]" />
                  ) : (
                    <span className="text-[10px] text-[#8b93b5] font-mono">
                      {loc.lat.toFixed(2)}° N
                    </span>
                  )}
                </div>
              );
            })}

            {/* No match state */}
            {filteredItems.length === 0 && liveSuggestions.length === 0 && !isSearching && search.trim().length >= 2 && (
              <div className="p-6 text-center text-xs text-[#4a5578] font-tamil space-y-2.5">
                <Globe className="w-8 h-8 text-[#2454c7]/60 mx-auto" />
                <div>
                  {lang === "ta"
                    ? `"${search}" என்ற ஊரின் அட்ச தீர்க்க ரேகைகளை Geocoding API மூலம் கண்டறியலாம்.`
                    : `Resolve coordinates for "${search}" via Open Geocoding API.`}
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveAndApply(search)}
                  disabled={isResolving}
                  className="px-4 py-2 bg-[#2454c7] hover:bg-[#17348f] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isResolving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Resolving coordinates..."}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? `"${search}"-ஐ நேரடியாகப் பயன்படுத்து` : `Use "${search}" with live GPS`}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer: Manual Custom Coordinate Option */}
          <div className="p-3 bg-[#e7eefb] border-t border-[#8b93b5]/30 flex flex-col gap-2">
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="text-[11px] text-[#17348f] hover:underline font-tamil flex items-center justify-center gap-1 w-full py-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                {lang === "ta"
                  ? "துல்லிய அட்சரேகை (Custom Lat/Lon) நேரடியாக உள்ளிட"
                  : "Enter custom town with exact coordinates"}
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-[#17348f] font-tamil">
                  {lang === "ta" ? "சுய ஊர் விவரம் (Custom Coordinates)" : "Custom Location Coordinates"}
                </div>
                <input
                  type="text"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder={lang === "ta" ? "ஊரின் பெயர் (e.g. Srivilliputhur / Tenkasi)" : "Place name (e.g. Srivilliputhur)"}
                  className="w-full px-3 py-1.5 bg-[#fbfdff] border border-[#8b93b5]/70 rounded-lg text-xs text-[#161b33] outline-none focus:border-[#2454c7]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude (e.g. 9.51)"
                    className="w-full px-2.5 py-1 bg-[#fbfdff] border border-[#8b93b5]/70 rounded-lg text-[11px] text-[#161b33] outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="Longitude (e.g. 77.63)"
                    className="w-full px-2.5 py-1 bg-[#fbfdff] border border-[#8b93b5]/70 rounded-lg text-[11px] text-[#161b33] outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="px-3 py-1 text-[10px] text-[#4a5578] hover:text-[#161b33]"
                  >
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustom}
                    className="px-4 py-1 bg-[#2454c7] text-white rounded-lg text-xs font-bold hover:bg-[#17348f]"
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
