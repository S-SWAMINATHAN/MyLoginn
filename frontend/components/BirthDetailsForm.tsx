"use client";

import React, { useState } from "react";
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

interface BirthDetailsFormProps {
  onSubmit: (data: GenerateChartRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  isLoading,
  lang,
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
            {lang === "ta" ? "பஞ்சாங்க கணிப்பு முறை" : "Panchangam Convention"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "thirukkanitham" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "thirukkanitham"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "திருக்கணிதம்" : "Thirukanitham"}</div>
              <span className="text-[9px] opacity-85 block">Drik-Siddha</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "vakhyam" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "vakhyam"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "வாக்கியம்" : "Vakhyam"}</div>
              <span className="text-[9px] opacity-85 block">Traditional</span>
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
            {lang === "ta" ? "அறிக்கை வடிவம்" : "Report Format"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "full" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "full"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "முழு ஜாதகம்" : "Full Report"}</div>
              <span className="text-[9px] opacity-85 block">All 12 Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "single_page" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "single_page"
                  ? "choice-active"
                  : "choice"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "சுருக்க ஜாதகம்" : "Quick Summary"}</div>
              <span className="text-[9px] opacity-85 block">Single Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Parents & Horoscope Bio-Data Accordion */}
      <div className="mt-6 pt-5 border-t border-border-soft">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface/80 border-2 border-brand-500/30 hover:border-brand-500 transition-all text-left shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-brand-fg group-hover:scale-110 transition-transform" />
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-brand-500/10 text-brand-fg font-semibold px-2 py-0.5 rounded-full">
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
                  <input
                    type="text"
                    value={formData.father_name || ""}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value, parent_name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. கா. ராமநாதன்" : "e.g. K. Ramanathan"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தந்தை தொழில் / பணி (Father's Work)" : "Father's Occupation"}
                  </label>
                  <input
                    type="text"
                    value={formData.father_occupation || ""}
                    onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. அரசு ஆசிரியர் / வணிகம்" : "e.g. Govt Teacher / Business"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தாய் பெயர் (Mother's Name)" : "Mother's Full Name"}
                  </label>
                  <input
                    type="text"
                    value={formData.mother_name || ""}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. பார்வதி ராமநாதன்" : "e.g. Parvathi Ramanathan"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தாய் தொழில் / பணி (Mother's Work)" : "Mother's Occupation"}
                  </label>
                  <input
                    type="text"
                    value={formData.mother_occupation || ""}
                    onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. இல்லத்தரசி / வங்கிப்பணி" : "e.g. Home Maker / Bank Officer"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "கோத்திரம் / குலம் (Gothram / Kulam)" : "Gothram / Kulam"}
                  </label>
                  <input
                    type="text"
                    value={formData.gothram || ""}
                    onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. காசியப / சிவ கோத்திரம்" : "e.g. Kashyapa / Shiva Gothram"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "பூர்வீகம் / சொந்த ஊர் (Native Place)" : "Ancestral Town / Native"}
                  </label>
                  <input
                    type="text"
                    value={formData.native_place || ""}
                    onChange={(e) => setFormData({ ...formData, native_place: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. திருநெல்வேலி / தஞ்சாவூர்" : "e.g. Tirunelveli / Thanjavur"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "குலதெய்வம் & கோவில் (Kula Deivam)" : "Family Deity & Temple Place"}
                  </label>
                  <input
                    type="text"
                    value={formData.kula_deivam || ""}
                    onChange={(e) => setFormData({ ...formData, kula_deivam: e.target.value, family_details: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. ஸ்ரீ அங்காளம்மன் கோவில்" : "e.g. Sri Angalamman Temple"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "சாதி / உட்பிரிவு (Caste / Community)" : "Caste / Sub-Caste"}
                  </label>
                  <input
                    type="text"
                    value={formData.caste_subcaste || ""}
                    onChange={(e) => setFormData({ ...formData, caste_subcaste: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. பிள்ளை / முதலியார் / செட்டியார்" : "e.g. Community / Sub-caste"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "உடன் பிறந்தோர் விவரம் (Siblings)" : "Brothers & Sisters"}
                  </label>
                  <input
                    type="text"
                    value={formData.siblings || ""}
                    onChange={(e) => setFormData({ ...formData, siblings: e.target.value })}
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
                  <input
                    type="text"
                    value={formData.education || ""}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. B.E. (Computer Science), MBA" : "e.g. B.Tech / M.S / MBA"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "தொழில் / உத்தியோகம் (Profession)" : "Designation / Company"}
                  </label>
                  <input
                    type="text"
                    value={formData.occupation || ""}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. Senior Software Engineer" : "e.g. Software Lead / Govt Officer"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "மாத / ஆண்டு வருமானம் (Income)" : "Annual Income (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={formData.annual_income || ""}
                    onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-foreground text-xs outline-none focus:border-brand-500"
                    placeholder={lang === "ta" ? "எ.கா. 12 LPA / ₹1,00,000" : "e.g. ₹15 LPA"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {lang === "ta" ? "உயரம் / உடல்வாகு (Height)" : "Height / Appearance"}
                  </label>
                  <input
                    type="text"
                    value={formData.height || ""}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                  <input
                    type="text"
                    value={formData.residence_address || ""}
                    onChange={(e) => setFormData({ ...formData, residence_address: e.target.value })}
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