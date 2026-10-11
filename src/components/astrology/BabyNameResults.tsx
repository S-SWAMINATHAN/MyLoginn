"use client";

import React from "react";
import { BabyNameResult } from "@/lib/astrology/types";
import { BabyNameSuggestions } from "./BabyNameSuggestions";

interface BabyNameResultsProps {
  babyNames: BabyNameResult;
  lang: "ta" | "en";
}

/**
 * Results panel for the standalone /baby-names page.
 *
 * WHY THIS IS NOW A ONE-LINE WRAPPER
 * ----------------------------------
 * There were two separate implementations of the same panel with the same
 * props: this one (used by /baby-names) and BabyNameSuggestions (used inside
 * a full Jathagam). They drifted — an upgrade applied to one silently did
 * not appear on the other, which is why the language handling, religion
 * filter, pada grouping and PDF button were missing from this page.
 *
 * There is now ONE implementation. This file stays only so existing imports
 * keep working.
 */
export const BabyNameResults: React.FC<BabyNameResultsProps> = ({ babyNames, lang }) => (
  <BabyNameSuggestions babyNames={babyNames} lang={lang} />
);

export default BabyNameResults;
