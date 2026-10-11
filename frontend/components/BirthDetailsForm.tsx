"use client";

import React, { useEffect, useState } from "react";
import { GenerateChartRequest } from "@/lib/types";
import {
  Calendar,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  GraduationCap,
  Users,
  Phone,
  Mail,
  MapPin,
  Home,
  HeartHandshake
} from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";
import { LocationPicker } from "./LocationPicker";
import { TamilNameInput } from "./TamilNameInput";

type ChoiceLabel = { ta: string; en: string; sub?: string };

interface BirthDetailsFormProps {
  onSubmit: (data: GenerateChartRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
  /** Optional: rename the two convention buttons (KP uses them for Birth chart / Horary). */
  systemLabels?: { thirukkanitham: ChoiceLabel; vakhyam: ChoiceLabel; heading?: ChoiceLabel };
  /** Optional: rename the two report-format buttons (KP: KP All / KP Type A). */
  outputLabels?: { full: ChoiceLabel; single_page: ChoiceLabel; heading?: ChoiceLabel; custom?: ChoiceLabel };
  /** Optional: called whenever the convention / format / chart-style buttons change. */
  onModeChange?: (m: { panchangam_system: string; output_mode: string; chart_style: string }) => void;
  /** Optional extra fields shown inside the form, after the format buttons. */
  children?: React.ReactNode;
}

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  isLoading,
  lang,
  systemLabels,
  outputLabels,
  onModeChange,
  children,
}) => {
  const [formData, setFormData] = useState<GenerateChartRequest>({
    name: "",
    gender: "",
    date_of_birth: "",
    time_of_birth: "07:00:00",
    place: "",
    latitude: null,
    longitude: null,
    timezone: null,
    panchangam_system: "thirukkanitham",
    chart_style: "tamil",
    output_mode: "full",
    parent_name: "",
    phone: "",
    email: "",
    personal_details: "",
    family_details: "",
    // Extended Parents & Bio-Data fields
    father_name: "",
    father_occupation: "",
    mother_name: "",
    mother_occupation: "",
    gothram: "",
    kula_deivam: "",
    kula_deivam_place: "",
    native_place: "",
    caste_subcaste: "",
    siblings: "",
    education: "",
    occupation: "",
    annual_income: "",
    height: "",
    alternate_phone: "",
    residence_address: "",
  });

  useEffect(() => {
    onModeChange?.({
      panchangam_system: String(formData.panchangam_system ?? "thirukkanitham"),
      output_mode: String((formData as { output_mode?: string }).output_mode ?? "full"),
      chart_style: String((formData as { chart_style?: string }).chart_style ?? "tamil"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.panchangam_system, (formData as { output_mode?: string }).output_mode, (formData as { chart_style?: string }).chart_style]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fresh-load guard: nothing is pre-filled any more, so the form must not be
  // submittable until the four values the ephemeris actually needs are present.
  const canSubmit =
    !!(formData.name || "").trim() &&
    !!formData.gender &&
    !!formData.date_of_birth &&
    !!(formData.place || "").trim() &&
    !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 sm:p-8 backdrop-blur-md shadow-lg transition-all"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-fg" />
            {lang === "ta" ? "பிறப்பு விவரங்கள் (Birth Details)" : "Birth Details Intake"}
          </h2>
          <p className="text-xs text-muted mt-1">
            {lang === "ta"
              ? "துல்லியமான ஜாதகக் கணிப்பிற்கு பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்"
              : "Enter accurate birth date, time and location for deterministic calculation"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {lang === "ta" ? "பெயர் (Name)" : "Full Name"} <span className="text-brand-fg">*</span>
          </label>
          {/* Bug 1: in Tamil mode, Thanglish input gets Tamil spelling suggestions */}
          <TamilNameInput
            required
            value={formData.name || ""}
            onChange={(v, latin) =>
              setFormData((prev) => ({
                ...prev,
                name: v,
                // Keep the Thanglish original only when a Tamil suggestion was
                // accepted, so the chart can show the name in either language.
                name_en: latin || undefined,
              }))
            }
            lang={lang}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border-2 border-line rounded-xl text-foreground placeholder:text-muted/60 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm outline-none"
            placeholder={lang === "ta" ? "உங்கள் பெயர் (எ.கா. guruprasath → குருபிரசாத்)" : "e.g. Anand"}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {lang === "ta" ? "பாலினம் (Gender)" : "Gender"} <span className="text-brand-fg">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "male" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "male"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              {lang === "ta" ? "ஆண் (Male)" : "Male"}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "female" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "female"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              {lang === "ta" ? "பெண் (Female)" : "Female"}
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {lang === "ta" ? "பிறந்த தேதி (Date of Birth)" : "Date of Birth"} <span className="text-brand-fg">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-fg/80" />
            <input
              type="date"
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border-2 border-line rounded-xl text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm outline-none"
            />
          </div>
        </div>

        {/* Time of Birth */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Exact Time of Birth"} <span className="text-brand-fg">*</span>
          </label>
          <TimeInput12h
            value={formData.time_of_birth}
            onChange={(time24h) => setFormData({ ...formData, time_of_birth: time24h })}
          />
        </div>

        {/* Place of Birth */}
        <div className="relative md:col-span-2">
          <LocationPicker
            value={formData.place}
            onChange={(placeName, lat, lon, timezone) => {
              setFormData((prev) => ({
                ...prev,
                place: placeName,
                latitude: lat ?? null,
                longitude: lon ?? null,
                timezone: timezone ?? null,
              }));
            }}
            lang={lang}
            label={lang === "ta" ? "பிறந்த இடம் (Place of Birth)" : "Place of Birth (City / Town)"}
            required
            placeholder={lang === "ta" ? "எ.கா. கோயம்புத்தூர் / மதுரை" : "e.g. Coimbatore, Tamil Nadu"}
          />
        </div>
      </div>

      {/* Selectors: Panchangam System, Chart Style, Output Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-border-soft">
        {/* Panchangam System */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {systemLabels?.heading ? (lang === "ta" ? systemLabels.heading.ta : systemLabels.heading.en) : (lang === "ta" ? "பஞ்சாங்க கணிப்பு முறை" : "Panchangam Convention")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "thirukkanitham" })}
              className={`min-w-0 break-words py-2 px-1.5 sm:px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "thirukkanitham"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{systemLabels ? (lang === "ta" ? systemLabels.thirukkanitham.ta : systemLabels.thirukkanitham.en) : (lang === "ta" ? "திருக்கணிதம்" : "Thirukanitham")}</div>
              <span className="text-[9px] opacity-85 block">{systemLabels ? systemLabels.thirukkanitham.sub ?? "" : "Drik-Siddha"}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "vakhyam" })}
              className={`min-w-0 break-words py-2 px-1.5 sm:px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "vakhyam"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{systemLabels ? (lang === "ta" ? systemLabels.vakhyam.ta : systemLabels.vakhyam.en) : (lang === "ta" ? "வாக்கியம்" : "Vakhyam")}</div>
              <span className="text-[9px] opacity-85 block">{systemLabels ? systemLabels.vakhyam.sub ?? "" : "Traditional"}</span>
            </button>
          </div>
        </div>

        {/* Regional Chart Style */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {lang === "ta" ? "கட்ட அமைப்பு பாணி" : "Regional Layout"}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "tamil", labelTa: "தமிழ்", labelEn: "Tamil" },
              { id: "kerala", labelTa: "கேரளா", labelEn: "Kerala" },
              { id: "north_indian", labelTa: "வட இந்தியா", labelEn: "North" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFormData({ ...formData, chart_style: st.id })}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.chart_style === st.id
                    ? "choice-active"
                    : "choice"
                }`}
              >
                {lang === "ta" ? st.labelTa : st.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Output Mode */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">
            {outputLabels?.heading ? (lang === "ta" ? outputLabels.heading.ta : outputLabels.heading.en) : (lang === "ta" ? "அறிக்கை வடிவம்" : "Report Format")}
          </label>
          <div className={`grid gap-2 ${outputLabels?.custom ? "grid-cols-3" : "grid-cols-2"}`}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "full" })}
              className={`min-w-0 break-words py-2 px-1.5 sm:px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "full"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{outputLabels ? (lang === "ta" ? outputLabels.full.ta : outputLabels.full.en) : (lang === "ta" ? "முழு ஜாதகம்" : "Full Report")}</div>
              <span className="text-[9px] opacity-85 block">{outputLabels ? outputLabels.full.sub ?? "" : "All 12 Sections"}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "single_page" })}
              className={`min-w-0 break-words py-2 px-1.5 sm:px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "single_page"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{outputLabels ? (lang === "ta" ? outputLabels.single_page.ta : outputLabels.single_page.en) : (lang === "ta" ? "சுருக்க ஜாதகம்" : "Quick Summary")}</div>
              <span className="text-[9px] opacity-85 block">{outputLabels ? outputLabels.single_page.sub ?? "" : "Single Page"}</span>
            </button>

            {outputLabels?.custom && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, output_mode: "custom" })}
                className={`min-w-0 break-words py-2 px-1.5 sm:px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.output_mode === "custom" ? "choice-active" : "choice"
                }`}
              >
                <div className="font-semibold">{lang === "ta" ? outputLabels.custom.ta : outputLabels.custom.en}</div>
                <span className="text-[9px] opacity-85 block">{outputLabels.custom.sub ?? ""}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {children}

      {/* Comprehensive Parents & Horoscope Bio-Data Accordion */}
      <div className="mt-6 pt-5 border-t border-border-soft">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface/80 border-2 border-brand-500/30 hover:border-brand-500 transition-all text-left shadow-xs group"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 shrink-0 text-brand-fg group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-sm font-bold text-foreground block">
                {lang === "ta"
                  ? "பெற்றோர் மற்றும் ஜாதக சுயவிவரப் பயோடேட்டா (Parents & Candidate Bio-Data)"
                  : "Parents & Candidate Horoscope Bio-Data (Optional)"}
              </span>
              <span className="text-[10.5px] text-muted block">
                {lang === "ta"
                  ? "தந்தை, தாய் பெயர், தொழில், கோத்திரம், குலதெய்வம், கல்வி மற்றும் திருமண வரன் விபரம்"
                  : "Add parents' profession, gothram, kula deivam, candidate education & matrimony details"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[10px] bg-brand-500/10 text-brand-fg font-semibold px-2 py-0.5 rounded-full sm:inline">
              {showAdvanced ? (lang === "ta" ? "மறைக்க" : "Hide") : (lang === "ta" ? "விரிவாக்க" : "Expand")}
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-brand-fg" /> : <ChevronDown className="w-4 h-4 text-brand-fg" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="mt-4 p-5 bg-surface/95 border-2 border-border-soft rounded-2xl space-y-6 animate-fade-in shadow-inner">
            {/* Section 1: Parents & Family */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-border-soft">
                <Users className="w-4 h-4 text-brand-fg" />
                <h3 className="text-xs font-bold text-brand-fg tracking-wide uppercase">
                  {lang === "ta" ? "1. பெற்றோர் & குடும்பப் பின்னணி (Parents & Family)" : "1. Parents & Family Background"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தந்தை பெயர் (Father's Name)" : "Father's Full Name"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.father_name || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, father_name: v, parent_name: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. கா. ராமநாதன்" : "e.g. K. Ramanathan"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தந்தை தொழில் / பணி (Father's Work)" : "Father's Occupation"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.father_occupation || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, father_occupation: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. அரசு ஆசிரியர் / வணிகம்" : "e.g. Govt Teacher / Business"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தாய் பெயர் (Mother's Name)" : "Mother's Full Name"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.mother_name || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, mother_name: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. பார்வதி ராமநாதன்" : "e.g. Parvathi Ramanathan"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தாய் தொழில் / பணி (Mother's Work)" : "Mother's Occupation"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.mother_occupation || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, mother_occupation: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. இல்லத்தரசி / வங்கிப்பணி" : "e.g. Home Maker / Bank Officer"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "கோத்திரம் / குலம் (Gothram / Kulam)" : "Gothram / Kulam"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.gothram || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, gothram: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. காசியப / சிவ கோத்திரம்" : "e.g. Kashyapa / Shiva Gothram"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "பூர்வீகம் / சொந்த ஊர் (Native Place)" : "Ancestral Town / Native"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.native_place || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, native_place: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. திருநெல்வேலி / தஞ்சாவூர்" : "e.g. Tirunelveli / Thanjavur"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "குலதெய்வம் & கோவில் (Kula Deivam)" : "Family Deity & Temple Place"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.kula_deivam || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, kula_deivam: v, family_details: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. ஸ்ரீ அங்காளம்மன் கோவில்" : "e.g. Sri Angalamman Temple"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "சாதி / உட்பிரிவு (Caste / Community)" : "Caste / Sub-Caste"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.caste_subcaste || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, caste_subcaste: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. பிள்ளை / முதலியார் / செட்டியார்" : "e.g. Community / Sub-caste"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "உடன் பிறந்தோர் விவரம் (Siblings)" : "Brothers & Sisters"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.siblings || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, siblings: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. 1 அண்ணன் (திருமணமானவர்), 1 தங்கை" : "e.g. 1 elder brother (married), 1 sister"}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Candidate Education & Profession */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-border-soft">
                <GraduationCap className="w-4 h-4 text-brand-fg" />
                <h3 className="text-xs font-bold text-brand-fg tracking-wide uppercase">
                  {lang === "ta" ? "2. ஜாதகர் கல்வி & தொழில் தகுதி (Candidate Bio-Data)" : "2. Candidate Education & Profession"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "கல்வித் தகுதி (Education)" : "Educational Degree"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.education || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, education: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. B.E. (Computer Science), MBA" : "e.g. B.Tech / M.S / MBA"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தொழில் / உத்தியோகம் (Profession)" : "Designation / Company"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.occupation || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, occupation: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. Senior Software Engineer" : "e.g. Software Lead / Govt Officer"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "மாத / ஆண்டு வருமானம் (Income)" : "Annual Income (Optional)"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.annual_income || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, annual_income: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. 12 LPA / ₹1,00,000" : "e.g. ₹15 LPA"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "உயரம் / உடல்வாகு (Height)" : "Height / Appearance"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.height || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, height: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. 5 அடி 9 அங்குலம் (175 cm)" : "e.g. 5' 9\" (175 cm)"}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Address */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-border-soft">
                <Phone className="w-4 h-4 text-brand-fg" />
                <h3 className="text-xs font-bold text-brand-fg tracking-wide uppercase">
                  {lang === "ta" ? "3. தொடர்பு விபரங்கள் & முகவரி (Contact & Address)" : "3. Contact Information & Address"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "முதன்மை கைபேசி (Phone)" : "Primary Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "வாட்ஸ்அப் / மாற்று எண்" : "Alternate Phone / WhatsApp"}
                  </label>
                  <input
                    type="tel"
                    value={formData.alternate_phone || ""}
                    onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder="+91 94432 10987"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "மின்னஞ்சல் (Email)" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "இருப்பிட முகவரி (Address)" : "Residential Address"}
                  </label>
                  <TamilNameInput
                    hideIcon
                    lang={lang}
                    value={formData.residence_address || ""}
                    onChange={(v) => setFormData((prev) => ({ ...prev, residence_address: v }))}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "கதவு எண், தெரு, ஊர், பின்கோடு" : "Door No, Street, City, Pincode"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-3.5 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 font-semibold"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing Astronomical Chart..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-white" />
              <span>{lang === "ta" ? "ஜாதகத்தை உருவாக்கு (Generate Jathagam)" : "Generate Full Birth Chart"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};