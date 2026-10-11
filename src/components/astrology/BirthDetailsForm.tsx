"use client";

import React, { useEffect, useState } from "react";
import { GenerateChartRequest } from "@/lib/astrology/types";
import {
  Calendar,
  User,
  Sparkles,
  ChevronDown,
  Users,
  Phone,
  MapPin,
  HeartHandshake,
  GraduationCap,
  Clock,
  Check,
  Settings2,
} from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";
import { LocationPicker } from "./LocationPicker";
import { TamilNameInput } from "./TamilNameInput";
import { DateInput } from "@/components/astrology/ui/DateInput";

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

type BioKey =
  | "father_name" | "father_occupation" | "mother_name" | "mother_occupation"
  | "gothram" | "native_place" | "kula_deivam" | "caste_subcaste" | "siblings"
  | "education" | "occupation" | "annual_income" | "height"
  | "phone" | "alternate_phone" | "email" | "residence_address";

type BioField = {
  key: BioKey;
  ta: string;
  en: string;
  phTa: string;
  phEn: string;
  kind?: "tel" | "email";
};

const FAMILY_FIELDS: BioField[] = [
  { key: "father_name", ta: "தந்தை பெயர்", en: "Father's name", phTa: "எ.கா. கா. ராமநாதன்", phEn: "e.g. K. Ramanathan" },
  { key: "father_occupation", ta: "தந்தை தொழில்", en: "Father's occupation", phTa: "எ.கா. அரசு ஆசிரியர் / வணிகம்", phEn: "e.g. Govt Teacher / Business" },
  { key: "mother_name", ta: "தாய் பெயர்", en: "Mother's name", phTa: "எ.கா. பார்வதி ராமநாதன்", phEn: "e.g. Parvathi Ramanathan" },
  { key: "mother_occupation", ta: "தாய் தொழில்", en: "Mother's occupation", phTa: "எ.கா. இல்லத்தரசி / வங்கிப்பணி", phEn: "e.g. Home Maker / Bank Officer" },
  { key: "gothram", ta: "கோத்திரம் / குலம்", en: "Gothram / Kulam", phTa: "எ.கா. காசியப / சிவ கோத்திரம்", phEn: "e.g. Kashyapa / Shiva Gothram" },
  { key: "native_place", ta: "பூர்வீகம் / சொந்த ஊர்", en: "Native place", phTa: "எ.கா. திருநெல்வேலி / தஞ்சாவூர்", phEn: "e.g. Tirunelveli / Thanjavur" },
  { key: "kula_deivam", ta: "குலதெய்வம் & கோவில்", en: "Kula deivam & temple", phTa: "எ.கா. ஸ்ரீ அங்காளம்மன் கோவில்", phEn: "e.g. Sri Angalamman Temple" },
  { key: "caste_subcaste", ta: "சாதி / உட்பிரிவு", en: "Caste / sub-caste", phTa: "எ.கா. பிள்ளை / முதலியார் / செட்டியார்", phEn: "e.g. Community / Sub-caste" },
  { key: "siblings", ta: "உடன் பிறந்தோர்", en: "Siblings", phTa: "எ.கா. 1 அண்ணன் (திருமணமானவர்), 1 தங்கை", phEn: "e.g. 1 elder brother (married), 1 sister" },
];

const PROFILE_FIELDS: BioField[] = [
  { key: "education", ta: "கல்வித் தகுதி", en: "Education", phTa: "எ.கா. B.E. (Computer Science), MBA", phEn: "e.g. B.Tech / M.S / MBA" },
  { key: "occupation", ta: "தொழில் / உத்தியோகம்", en: "Designation / company", phTa: "எ.கா. Senior Software Engineer", phEn: "e.g. Software Lead / Govt Officer" },
  { key: "annual_income", ta: "வருமானம்", en: "Annual income", phTa: "எ.கா. 12 LPA / ₹1,00,000", phEn: "e.g. ₹15 LPA" },
  { key: "height", ta: "உயரம்", en: "Height", phTa: "எ.கா. 5 அடி 9 அங்குலம் (175 cm)", phEn: "e.g. 5' 9\" (175 cm)" },
];

const CONTACT_FIELDS: BioField[] = [
  { key: "phone", ta: "முதன்மை கைபேசி", en: "Mobile number", phTa: "+91 98765 43210", phEn: "+91 98765 43210", kind: "tel" },
  { key: "alternate_phone", ta: "வாட்ஸ்அப் / மாற்று எண்", en: "Alternate / WhatsApp", phTa: "+91 94432 10987", phEn: "+91 94432 10987", kind: "tel" },
  { key: "email", ta: "மின்னஞ்சல்", en: "Email", phTa: "name@example.com", phEn: "name@example.com", kind: "email" },
  { key: "residence_address", ta: "முகவரி", en: "Address", phTa: "கதவு எண், தெரு, ஊர், பின்கோடு", phEn: "Door No, Street, City, Pincode" },
];

const inputCls = "field";

/** Local "YYYY-MM-DD" for today — a birth date can't be in the future. */
const todayIso = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

/** One numbered section of the form. */
const Section: React.FC<{
  step: number;
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  done?: boolean;
  children: React.ReactNode;
}> = ({ step, title, hint, done, children }) => (
  <section className="rounded-2xl border border-border-soft bg-surface-2/40 p-3.5 sm:p-4">
    <header className="mb-3 flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          done ? "bg-success/15 text-success" : "bg-brand-500/10 text-brand-fg"
        }`}
        aria-hidden
      >
        {done ? <Check className="h-4 w-4" /> : step}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold leading-tight text-foreground sm:text-base">{title}</h3>
        {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{hint}</p>}
      </div>
    </header>
    {children}
  </section>
);

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="field-label">
    <span>
      {children} {required && <span className="text-brand-fg">*</span>}
    </span>
  </label>
);

/** Radio-card option. `row` puts title and sub on one line (never wraps). */
const Option: React.FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
  row?: boolean;
  /** title and sub-label centred on one line */
  inline?: boolean;
}> = ({ active, onClick, title, sub, row, inline }) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    className={`flex min-w-0 items-center rounded-xl border py-2.5 whitespace-nowrap ${row ? "px-3" : "px-1"} transition-all ${
      row ? "flex-row justify-between gap-3 text-left" : inline ? "flex-row justify-center gap-1.5 text-center" : "flex-col justify-center text-center"
    } ${active ? "choice-active" : "choice"}`}
  >
    <span className={`text-[13px] font-semibold leading-tight ${row ? "truncate" : ""}`}>{title}</span>
    {sub ? <span className={`truncate text-[10.5px] leading-tight opacity-80 ${row || inline ? "" : "mt-0.5"}`}>{sub}</span> : null}
  </button>
);

const PrefGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="field-label">
      <span>{label}</span>
    </div>
    {children}
  </div>
);

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  isLoading,
  lang,
  systemLabels,
  outputLabels,
  onModeChange,
  children,
}) => {
  const ta = lang === "ta";
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
  const hasName = !!(formData.name || "").trim();
  const hasGender = !!formData.gender;
  const hasDob = !!formData.date_of_birth;
  const hasPlace = !!(formData.place || "").trim();
  const filled = [hasName, hasGender, hasDob, hasPlace].filter(Boolean).length;
  const canSubmit = filled === 4 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const setBio = (key: BioKey, v: string) =>
    setFormData((prev) => ({
      ...prev,
      [key]: v,
      // Keep the legacy summary fields in sync, as before.
      ...(key === "father_name" ? { parent_name: v } : {}),
      ...(key === "kula_deivam" ? { family_details: v } : {}),
    }));

  const renderBio = (f: BioField) => {
    const value = ((formData as unknown as Record<string, string | undefined>)[f.key]) || "";
    const placeholder = ta ? f.phTa : f.phEn;
    return (
      <div key={f.key} className="min-w-0">
        <label className="field-label">
          <span>
            {ta ? f.ta : f.en}
          </span>
        </label>
        {f.kind ? (
          <input
            type={f.kind}
            value={value}
            onChange={(e) => setBio(f.key, e.target.value)}
            className={inputCls}
            placeholder={placeholder}
          />
        ) : (
          <TamilNameInput
            hideIcon
            lang={lang}
            value={value}
            onChange={(v) => setBio(f.key, v)}
            className={inputCls}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  const sys = formData.panchangam_system;
  const mode = (formData as { output_mode?: string }).output_mode;
  const style = (formData as { chart_style?: string }).chart_style;

  return (
    <form onSubmit={handleSubmit} className="card overflow-visible p-4 sm:p-6 lg:p-8">
      {/* Title */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border-soft pb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <Sparkles className="h-5 w-5 shrink-0 text-brand-fg" />
            {ta ? "பிறப்பு விவரங்கள் (Birth Details)" : "Birth Details"}
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-[13px]">
            {ta
              ? "துல்லியமான ஜாதகக் கணிப்பிற்கு பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்"
              : "Enter accurate birth date, time and place for a precise chart"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted" aria-live="polite">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2 sm:w-28">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(filled / 4) * 100}%` }}
            />
          </div>
          <span className="tabular-nums">{filled}/4 {ta ? "அவசியம்" : "required"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-6">
        {/* ── Left: who + when/where ── */}
        <div className="min-w-0 space-y-5">
          <Section
            step={1}
            icon={<User className="h-4 w-4" />}
            title={ta ? "ஜாதகர் விவரம்" : "About the person"}
            done={hasName && hasGender}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
              <div className="min-w-0">
                <Label required>{ta ? "பெயர் (Name)" : "Full name"}</Label>
                {/* in Tamil mode, Thanglish input gets Tamil spelling suggestions */}
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
                  className={`${inputCls} pl-10!`}
                  placeholder={ta ? "எ.கா. guruprasath → குருபிரசாத்" : "e.g. Anand"}
                />
              </div>

              <div className="min-w-0">
                <Label required>{ta ? "பாலினம் (Gender)" : "Gender"}</Label>
                <div role="radiogroup" className="grid grid-cols-2 gap-2">
                  <Option
                    active={formData.gender === "male"}
                    onClick={() => setFormData((p) => ({ ...p, gender: "male" }))}
                    inline
                    title={ta ? "ஆண்" : "Male"}
                    sub={ta ? "Male" : undefined}
                  />
                  <Option
                    active={formData.gender === "female"}
                    onClick={() => setFormData((p) => ({ ...p, gender: "female" }))}
                    inline
                    title={ta ? "பெண்" : "Female"}
                    sub={ta ? "Female" : undefined}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section
            step={2}
            icon={<Clock className="h-4 w-4" />}
            title={ta ? "பிறந்த நேரம் & இடம்" : "Birth moment & place"}
            hint={ta ? "நேரம் நிமிடம் வரை துல்லியமாக இருப்பது நல்லது" : "Time accurate to the minute gives the best result"}
            done={hasDob && hasPlace}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <Label required>{ta ? "பிறந்த தேதி (Date of Birth)" : "Date of birth"}</Label>
                <div className="relative">
                  <DateInput
                    required
                    max={todayIso()}
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData((p) => ({ ...p, date_of_birth: e.target.value }))}
                    className={`${inputCls} pl-10!`}
                  />
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand-fg/80" />
                </div>
              </div>

              <div className="min-w-0">
                <Label required>{ta ? "பிறந்த நேரம் (Time of Birth)" : "Time of birth"}</Label>
                <TimeInput12h
                  value={formData.time_of_birth}
                  onChange={(time24h) => setFormData((p) => ({ ...p, time_of_birth: time24h }))}
                />
              </div>

              <div className="min-w-0 sm:col-span-2">
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
                  label={ta ? "பிறந்த இடம் (Place of Birth)" : "Place of birth (city / town)"}
                  required
                  placeholder={ta ? "எ.கா. கோயம்புத்தூர் / மதுரை" : "e.g. Coimbatore, Tamil Nadu"}
                />
              </div>
            </div>
          </Section>

          {/* Optional bio-data */}
          <div className="rounded-2xl border border-border-soft bg-surface-2/40">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="group flex w-full items-center gap-3 p-4 text-left sm:p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-fg">
                <HeartHandshake className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-tight text-foreground sm:text-base">
                  {ta ? "பெற்றோர் & ஜாதக பயோடேட்டா" : "Parents & bio-data"}
                  <span className="ml-2 rounded-full bg-brand-500/10 px-2 py-0.5 align-middle text-[10px] font-semibold text-brand-fg">
                    {ta ? "விருப்பம்" : "Optional"}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">
                  {ta
                    ? "தந்தை, தாய், கோத்திரம், குலதெய்வம், கல்வி, தொடர்பு விபரம்"
                    : "Parents, gothram, kula deivam, education and contact details"}
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-brand-fg transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="animate-fade-in space-y-6 border-t border-border-soft p-4 sm:p-5">
                {(
                  [
                    [<Users key="f" className="h-4 w-4" />, ta ? "பெற்றோர் & குடும்பம்" : "Parents & family", FAMILY_FIELDS, "sm:grid-cols-2 xl:grid-cols-3"],
                    [<GraduationCap key="p" className="h-4 w-4" />, ta ? "கல்வி & தொழில்" : "Education & profession", PROFILE_FIELDS, "sm:grid-cols-2"],
                    [<Phone key="c" className="h-4 w-4" />, ta ? "தொடர்பு & முகவரி" : "Contact & address", CONTACT_FIELDS, "sm:grid-cols-2"],
                  ] as const
                ).map(([icon, title, fields, cols]) => (
                  <div key={title}>
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-fg">
                      {icon}
                      {title}
                    </div>
                    <div className={`grid grid-cols-1 gap-4 ${cols}`}>{fields.map(renderBio)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: chart preferences + submit ── */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-2xl border border-border-soft bg-surface-2/40 p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
              <Settings2 className="h-4 w-4 text-brand-fg" />
              {ta ? "ஜாதக அமைப்பு" : "Chart preferences"}
            </h3>

            <PrefGroup
              label={
                systemLabels?.heading
                  ? ta ? systemLabels.heading.ta : systemLabels.heading.en
                  : ta ? "பஞ்சாங்க கணிப்பு முறை" : "Panchangam convention"
              }
            >
              <div role="radiogroup" className="grid grid-cols-1 gap-2">
                <Option
                  row
                  active={sys === "thirukkanitham"}
                  onClick={() => setFormData((p) => ({ ...p, panchangam_system: "thirukkanitham" }))}
                  title={systemLabels ? (ta ? systemLabels.thirukkanitham.ta : systemLabels.thirukkanitham.en) : ta ? "திருக்கணிதம்" : "Thirukanitham"}
                  sub={systemLabels ? systemLabels.thirukkanitham.sub : "Drik-Siddha"}
                />
                <Option
                  row
                  active={sys === "vakhyam"}
                  onClick={() => setFormData((p) => ({ ...p, panchangam_system: "vakhyam" }))}
                  title={systemLabels ? (ta ? systemLabels.vakhyam.ta : systemLabels.vakhyam.en) : ta ? "வாக்கியம்" : "Vakhyam"}
                  sub={systemLabels ? systemLabels.vakhyam.sub : "Traditional"}
                />
              </div>
            </PrefGroup>

            <PrefGroup label={ta ? "கட்ட அமைப்பு பாணி" : "Regional layout"}>
              <div role="radiogroup" className="grid grid-cols-3 gap-2">
                {[
                  { id: "tamil", ta: "தமிழ்", en: "Tamil" },
                  { id: "kerala", ta: "கேரளா", en: "Kerala" },
                  { id: "north_indian", ta: "வட இந்தியா", en: "North" },
                ].map((st) => (
                  <Option
                    key={st.id}
                    active={style === st.id}
                    onClick={() => setFormData((p) => ({ ...p, chart_style: st.id }))}
                    title={ta ? st.ta : st.en}
                  />
                ))}
              </div>
            </PrefGroup>

            <PrefGroup
              label={
                outputLabels?.heading
                  ? ta ? outputLabels.heading.ta : outputLabels.heading.en
                  : ta ? "அறிக்கை வடிவம்" : "Report format"
              }
            >
              <div role="radiogroup" className="grid grid-cols-1 gap-2">
                <Option
                  row
                  active={mode === "full"}
                  onClick={() => setFormData((p) => ({ ...p, output_mode: "full" }))}
                  title={outputLabels ? (ta ? outputLabels.full.ta : outputLabels.full.en) : ta ? "முழு ஜாதகம்" : "Full report"}
                  sub={outputLabels ? outputLabels.full.sub : "All 12 sections"}
                />
                <Option
                  row
                  active={mode === "single_page"}
                  onClick={() => setFormData((p) => ({ ...p, output_mode: "single_page" }))}
                  title={outputLabels ? (ta ? outputLabels.single_page.ta : outputLabels.single_page.en) : ta ? "சுருக்க ஜாதகம்" : "Quick summary"}
                  sub={outputLabels ? outputLabels.single_page.sub : "Single page"}
                />
                {outputLabels?.custom && (
                  <Option
                    row
                    active={mode === "custom"}
                    onClick={() => setFormData((p) => ({ ...p, output_mode: "custom" }))}
                    title={ta ? outputLabels.custom.ta : outputLabels.custom.en}
                    sub={outputLabels.custom.sub}
                  />
                )}
              </div>
            </PrefGroup>

            {children}

            {/* Submit */}
            <div className="border-t border-border-soft pt-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary flex w-full items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-semibold sm:text-base"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{ta ? "கணிக்கப்படுகிறது..." : "Computing chart..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>{ta ? "ஜாதகத்தை உருவாக்கு" : "Generate Jathagam"}</span>
                  </>
                )}
              </button>
              {!canSubmit && !isLoading && (
                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
                  <MapPin className="h-3 w-3" />
                  {ta
                    ? "பெயர், பாலினம், தேதி, இடம் ஆகியவற்றை நிரப்பவும்"
                    : "Fill in name, gender, date and place to continue"}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
};
