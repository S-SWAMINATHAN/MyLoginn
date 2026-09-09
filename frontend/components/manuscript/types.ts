import { ChartResponse } from "@/lib/types";

export interface ManuscriptPageProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

export interface ChapterProps extends ManuscriptPageProps {
  activePage?: number;
}
