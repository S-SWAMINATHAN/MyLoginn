"use client";

import React, { useState } from "react";
import { NarrationResult } from "@/lib/types";
import { BookOpen, Sparkles, Volume2, Briefcase, Heart, Activity } from "lucide-react";

interface NarrationPanelProps {
  narration?: NarrationResult;
  lang: "ta" | "en";
}

export const NarrationPanel: React.FC<NarrationPanelProps> = ({ narration, lang }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "dasa" | "yogas" | "career" | "marriage" | "health">("summary");

  if (!narration) return null;

  const tabs = [
    { id: "summary", labelTa: "பொதுப் பலன்", labelEn: "Overview", icon: BookOpen },
    { id: "dasa", labelTa: "தசா பலன்", labelEn: "Dasha Reading", icon: Sparkles },
    { id: "yogas", labelTa: "யோகங்கள் & தோஷங்கள்", labelEn: "Yogas & Doshas", icon: Sparkles },
    { id: "career", labelTa: "தொழில் & தனம்", labelEn: "Career & Wealth", icon: Briefcase },
    { id: "marriage", labelTa: "குடும்பம் & திருமணம்", labelEn: "Marriage & Family", icon: Heart },
    { id: "health", labelTa: "ஆரோக்கியம்", labelEn: "Health & Vitality", icon: Activity },
  ];

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "ஜாதக விரிவான பலன்கள் (AI Narration)" : "Vedic Horoscope Life Reading"}
          </h3>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "கிரக நிலைகளின் அடிப்படையில் உருவாக்கப்பட்ட துல்லியமான தமிழ் & ஆங்கில வாழ்வியல் உரை"
              : "Structured deterministic narrative interpretation strictly derived from computed chart data"}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? "bg-[#6b1426] border border-[#ffd700] text-[#ffd700] shadow-md shadow-[#ffd700]/10"
                  : "bg-[#140b0e] border border-[#d4af37]/20 text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? tab.labelTa : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Content Display Card */}
      <div className="mt-6 p-6 rounded-2xl bg-[#1a1014]/90 border border-[#d4af37]/30 shadow-inner">
        {activeTab === "summary" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "பொது வாழ்க்கை சுருக்கம்" : "Life Summary & Core Placements"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.summary}
            </p>
          </div>
        )}

        {activeTab === "dasa" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "தற்போதைய மகா திசை பலன்கள்" : "Current Mahadasha & Planetary Influence"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.current_dasa_reading}
            </p>
          </div>
        )}

        {activeTab === "yogas" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "யோக பலன்கள் மற்றும் பரிகார விளக்கம்" : "Yogas & Planetary Remedies"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.yogas_and_doshas_reading}
            </p>
          </div>
        )}

        {activeTab === "career" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "தொழில், உத்தியோகம் மற்றும் தன லாபம்" : "Career, Status & Wealth Guidance"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.career_and_wealth}
            </p>
          </div>
        )}

        {activeTab === "marriage" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "களத்திர பாவம், இல்லற நல்லிணக்கம்" : "Marriage, Partnerships & Family Bliss"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.marriage_and_family}
            </p>
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-cinzel uppercase tracking-wider">
              {lang === "ta" ? "உடல் ஆரோக்கியம் மற்றும் ஆயுள் பலம்" : "Physical Health, Longevity & Vitality"}
            </h4>
            <p className="text-sm text-[#f5eedb]/90 leading-relaxed font-tamil">
              {narration.health_and_longevity}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
