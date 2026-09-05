"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, ChevronDown, Check, Plus, Globe, Navigation, Loader2 } from "lucide-react";
import { getGroupedLocationsApi, suggestPlacesApi } from "@/lib/api";
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
  const [customMode, setCustomMode] = useState(false);
  const [customPlace, setCustomPlace] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

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
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectLocation = (loc: { display_name: string; lat: number; lon: number; timezone?: string }) => {
    onChange(loc.display_name, loc.lat, loc.lon, loc.timezone || "Asia/Kolkata");
    setIsOpen(false);
    setSearch("");
    setCustomMode(false);
  };

  const handleApplyCustom = () => {
    if (!customPlace.trim()) return;
    const lat = customLat ? parseFloat(customLat) : undefined;
    const lon = customLon ? parseFloat(customLon) : undefined;
    onChange(customPlace.trim(), lat, lon, "Asia/Kolkata");
    setIsOpen(false);
    setCustomMode(false);
  };

  // Compile list based on active tab and search
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

      {/* Trigger Button - Parchment Handwritten Style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-10 py-2.5 bg-[#fbf7ee] border-2 border-[#a3917a]/60 hover:border-[#b03726] rounded-xl text-left text-sm text-[#2b2117] focus:outline-none focus:ring-2 focus:ring-[#b03726]/30 transition-all flex items-center justify-between shadow-sm"
      >
        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#b03726]" />
        <span className={`truncate font-tamil font-medium ${value ? "text-[#2b2117]" : "text-[#a3917a]"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3.5 top-3.5 w-4 h-4 text-[#6f6049] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#fdfaf2] border-2 border-[#8e2b1c]/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-fade-in max-w-lg w-full text-[#2b2117]">
          {/* Header Search */}
          <div className="p-3 border-b border-[#a3917a]/30 bg-[#f7efdc] space-y-2">
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-2.5 w-4 h-4 text-[#b03726] animate-spin" />
              ) : (
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8e2b1c]" />
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  lang === "ta"
                    ? "மாவட்டம், நகரம், கிராமம் அல்லது வெளிநாடு தேடுக..."
                    : "Search any village, town, city, or global place..."
                }
                autoFocus
                className="w-full pl-9 pr-3 py-2 bg-[#fffcf5] border border-[#a3917a]/70 rounded-xl text-[#2b2117] text-xs placeholder-[#6f6049]/60 outline-none focus:border-[#b03726] focus:ring-1 focus:ring-[#b03726]/40"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto text-[11px] font-tamil scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("tamil_nadu")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "tamil_nadu"
                    ? "bg-[#b03726] text-[#fffcf5] shadow-xs"
                    : "bg-[#eee2c7] text-[#2b2117]/80 hover:bg-[#e6d6b6]"
                }`}
              >
                {lang === "ta" ? "தமிழ்நாடு (38 மாவட்டங்கள்)" : "Tamil Nadu (38 Districts)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("india")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "india"
                    ? "bg-[#b03726] text-[#fffcf5] shadow-xs"
                    : "bg-[#eee2c7] text-[#2b2117]/80 hover:bg-[#e6d6b6]"
                }`}
              >
                {lang === "ta" ? "இந்திய நகரங்கள்" : "Other Indian Cities"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("global")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "global"
                    ? "bg-[#b03726] text-[#fffcf5] shadow-xs"
                    : "bg-[#eee2c7] text-[#2b2117]/80 hover:bg-[#e6d6b6]"
                }`}
              >
                {lang === "ta" ? "சர்வதேசம் (Diaspora)" : "Global Tamil Hubs"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-[#b03726] text-[#fffcf5] shadow-xs"
                    : "bg-[#eee2c7] text-[#2b2117]/80 hover:bg-[#e6d6b6]"
                }`}
              >
                {lang === "ta" ? "அனைத்தும்" : "All"}
              </button>
            </div>
          </div>

          {/* Quick Custom Add Banner if searching for an unlisted town */}
          {search && search.trim().length > 1 && (
            <div className="bg-[#f2e5cb] px-4 py-2 border-b border-[#a3917a]/30 flex items-center justify-between">
              <div className="text-xs text-[#2b2117] font-tamil truncate">
                {lang === "ta" ? "தேடும் ஊர்: " : "Searching: "}{" "}
                <span className="font-bold text-[#8e2b1c]">"{search}"</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectLocation({ display_name: `${search.trim()}, Tamil Nadu`, lat: 11.0168, lon: 76.9558 })}
                className="px-2.5 py-1 bg-[#b03726] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#8e2b1c] transition-colors"
              >
                <Plus className="w-3 h-3" />
                {lang === "ta" ? "நேரடியாக சேர்க்க" : "Use this place"}
              </button>
            </div>
          )}

          {/* Location List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#a3917a]/20 scrollbar-thin">
            {/* Live dynamic suggestions from free API */}
            {liveSuggestions.length > 0 && (
              <div className="bg-[#fbf4e2]">
                <div className="px-3 py-1 text-[10px] text-[#8e2b1c] uppercase font-bold tracking-wider bg-[#f3e7ce]">
                  {lang === "ta" ? "நேரடி தேடல் முடிவுகள் (Open Geocoding API)" : "Live Dynamic Results (Open Geocoding)"}
                </div>
                {liveSuggestions.map((item, idx) => (
                  <div
                    key={`live-${idx}`}
                    onClick={() => handleSelectLocation(item)}
                    className="px-4 py-2.5 text-xs text-[#2b2117] hover:bg-[#ecdcc2] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-[#b03726] shrink-0" />
                      <div>
                        <div className="font-tamil font-bold">{item.display_name}</div>
                        <div className="text-[10px] text-[#6f6049]">{item.timezone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#6f6049] font-mono shrink-0 ml-2">
                      {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Standard pre-indexed locations */}
            {filteredItems.map((loc) => {
              const isSelected = value.toLowerCase().includes(loc.name.toLowerCase());
              return (
                <div
                  key={loc.key}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between hover:bg-[#ecdcc2] transition-colors ${
                    isSelected ? "bg-[#e8d7bb] text-[#8e2b1c] font-bold" : "text-[#2b2117]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#8e2b1c]" : "text-[#a3917a]"}`} />
                    <div>
                      <div className="font-bold font-tamil">
                        {lang === "ta" ? loc.name_ta : loc.name}
                        {lang === "ta" && <span className="text-[#6f6049] text-[10px] ml-1.5 font-sans font-normal">({loc.name})</span>}
                      </div>
                      <div className="text-[10px] text-[#6f6049]">
                        {loc.state ? `${loc.state}, ` : ""}{loc.country}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#8e2b1c]" />
                  ) : (
                    <span className="text-[10px] text-[#a3917a] font-mono">
                      {loc.lat.toFixed(2)}° N
                    </span>
                  )}
                </div>
              );
            })}

            {filteredItems.length === 0 && liveSuggestions.length === 0 && !isSearching && (
              <div className="p-6 text-center text-xs text-[#6f6049] font-tamil space-y-2">
                <div>{lang === "ta" ? "பட்டியலில் இந்த ஊர் இல்லை." : "Location not found in instant list."}</div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomPlace(search);
                    setCustomMode(true);
                  }}
                  className="px-3 py-1.5 bg-[#b03726] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#8e2b1c]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === "ta" ? `"${search}" என புதிய ஊராக உள்ளிடுக` : `Enter "${search}" manually`}
                </button>
              </div>
            )}
          </div>

          {/* Footer: Manual Custom Place Option */}
          <div className="p-3 bg-[#f7efdc] border-t border-[#a3917a]/30 flex flex-col gap-2">
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="text-[11px] text-[#8e2b1c] hover:underline font-tamil flex items-center justify-center gap-1 w-full py-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                {lang === "ta"
                  ? "வேறு ஊர் அல்லது துல்லிய அட்சரேகை (Lat/Lon) நேரடியாக உள்ளிட"
                  : "Enter custom town or exact coordinates"}
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-[#8e2b1c] font-tamil">
                  {lang === "ta" ? "சுய ஊர் விவரம் (Custom Location)" : "Custom Location Details"}
                </div>
                <input
                  type="text"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder={lang === "ta" ? "ஊரின் பெயர் (e.g. Tenkasi / கிராமம்)" : "Place name (e.g. Srivilliputhur)"}
                  className="w-full px-3 py-1.5 bg-[#fffcf5] border border-[#a3917a]/70 rounded-lg text-xs text-[#2b2117] outline-none focus:border-[#b03726]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude (e.g. 9.17)"
                    className="w-full px-2.5 py-1 bg-[#fffcf5] border border-[#a3917a]/70 rounded-lg text-[11px] text-[#2b2117] outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="Longitude (e.g. 77.86)"
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
