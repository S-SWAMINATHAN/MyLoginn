"use client";

/**
 * Small cyan-blue line icons beside every Jathagam detail (Kanitha —
 * Thirukanitham / Vakkiyam, KP, single page, full jathagam). Same icon set
 * (Lucide) and the same blue as the header icons (#2F6FED, brand-500). The
 * printed PDFs use identical icons and the same rules
 * (backend/app/services/pdf/icons.py) — keep both lists in the same order.
 * A label with no related icon gets the star.
 *
 * The colour is passed as the SVG stroke attribute (not currentColor), so the
 * Jathagam colour panel never recolours it and the PDF export keeps the blue.
 */
import React from "react";
import {
  BookOpen, Bird, Briefcase, CalendarCheck, CalendarClock, CalendarDays, CalendarRange, Clock, Compass, Contrast, Eye,
  Flower2, Gauge, Globe, GraduationCap, Grid3x3, Hash, Heart, History, Hourglass, House, Infinity as InfinityIcon, Landmark,
  Layers, LayoutGrid, ListOrdered, MapPin, Moon, MoonStar, Navigation, Orbit, Phone, Repeat, RotateCw, Ruler, ScrollText,
  Shield, Sparkles, Star, SunMoon, Sunrise, Sunset, Target, Telescope, Timer, Type, User, UserCheck, UserRound, Users, Wallet,
  Waypoints, type LucideIcon,
} from "lucide-react";

export const ICON_BLUE = "#2F6FED";

// (pattern, icon) — first match wins; specific labels before general ones.
const RULES: [RegExp, LucideIcon][] = [
  [/தந்தை|father|தாயார்|தாய் பெயர்|^தாய்$|mother/i, Users],
  [/பிரசன்ன|horary/i, Hash],
  [/கூட்டு எண்|எண்|numerolog|நியுமராலஜி|number/i, Hash],
  [/எழுத்து|letter|இனிசியல்|initial/i, Type],
  [/பாலினம்|gender|\bsex\b/i, UserRound],
  [/சுய விவரம்|bio/i, UserCheck],
  [/பெயர்|\bname/i, User],
  [/தமிழ் தேதி|tamil date/i, CalendarRange],
  [/நடப்பு|current/i, CalendarClock],
  [/இருப்பு|balance/i, History],
  [/தேதி|\bdate/i, CalendarDays],
  [/பிறந்த நாள்|weekday/i, CalendarCheck],
  [/நேர மண்டலம்|time ?zone/i, Globe],
  [/நேர திருத்தம்|correction/i, Timer],
  [/நாழிகை|nazhigai|naligai/i, Hourglass],
  [/ஹோரை|sidereal/i, Telescope],
  [/நேரம்|\btime/i, Clock],
  [/உதயம்|sunrise/i, Sunrise],
  [/அஸ்தமன|sunset/i, Sunset],
  [/அட்சாம்சம்|latitude/i, Compass],
  [/தீர்க்காம்சம்|longitude/i, Navigation],
  [/ஊர்|place|native/i, MapPin],
  [/அயனாம்சம்|ayanamsa/i, Orbit],
  [/அயனம்|ayanam/i, SunMoon],
  [/தோஷ|dosh|sevvai|செவ்வாய்/i, Shield],
  [/பொருத்தம்|porutham|match|rajju/i, Heart],
  [/பலன்|palan/i, ScrollText],
  [/பார்வை|aspect/i, Eye],
  [/குறிப்பின|significator|காரக/i, Waypoints],
  [/பாவக மாற்றம்|bhava change/i, Repeat],
  [/காலச்சக்கிர|kalachakra/i, RotateCw],
  [/தசா|தசை|dasa|அந்தரம்|antharam|bhukti|புக்தி/i, Hourglass],
  [/நட்சத்திர|nakshatra|star/i, Sparkles],
  [/ராசி|rasi|moon sign/i, Moon],
  [/லக்ன|lagna|ascendant/i, Target],
  [/திதி|tithi|thithi/i, MoonStar],
  [/யோக|yoga/i, InfinityIcon],
  [/கரண|karana/i, Layers],
  [/பட்சம்|paksh/i, Contrast],
  [/அஷ்ட|ashtaka|சர்வாஷ்டக|பிரஸ்தார்|prasthara/i, LayoutGrid],
  [/வர்க்க|varga|சக்கர|chart/i, Grid3x3],
  [/பலம்|bala/i, Gauge],
  [/பட்சி|pakshi/i, Bird],
  [/கிரக|planet|graha/i, Orbit],
  [/பாவ|bhava|house|cusp/i, House],
  [/பொருளடக்கம்|contents/i, ListOrdered],
  [/பொது|general|basic/i, BookOpen],
  [/கல்வி|education/i, GraduationCap],
  [/தொழில்|occupation|profession/i, Briefcase],
  [/உயரம்|height/i, Ruler],
  [/முகவரி|address/i, House],
  [/தொடர்பு|phone|contact/i, Phone],
  [/வருமான|income/i, Wallet],
  [/கோத்திர|gothram|குலம்|caste|community/i, Landmark],
  [/மதம்|religion/i, Flower2],
];

export function iconFor(label: string): LucideIcon {
  const text = String(label ?? "");
  for (const [rx, Icon] of RULES) if (rx.test(text)) return Icon;
  return Star;
}

/** Inline icon sized to the text beside it (0.95em, on the baseline) — it never
 *  changes a row's height or a column's alignment. */
export function DIcon({ label, className = "" }: { label: string; className?: string }) {
  const Icon = iconFor(label);
  return (
    <Icon aria-hidden="true" color={ICON_BLUE} strokeWidth={2.1}
      className={`jat-ic inline-block shrink-0 ${className}`}
      style={{ width: "0.95em", height: "0.95em", verticalAlign: "-0.14em", marginRight: "0.32em" }} />
  );
}

/** Label text with its icon in front. */
export function IconLabel({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <DIcon label={text} />
      {text}
    </span>
  );
}
