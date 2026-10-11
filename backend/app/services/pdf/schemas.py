"""
Pydantic schemas for the print-quality PDF service (WeasyPrint).

POST /api/pdf/generate accepts one JSON document:

{
  "feature_type": "kanitha_jathagam" | "kp_jathagam" | "thirumana_porutham" | "baby_numerology",
  "god_image":    "ganesha" | "murugan" | "om",
  "language":     "ta" | "en",
  "chart_style":  "south" | "north",
  "metadata":     {...PdfMetadata...},
  "feature_data": {...one of KanithaData / KpData / PoruthamData / BabyData...}
}

All numbers and texts in feature_data are produced by the site's calculation
engines (Kalai-parity backend); the PDF service only lays them out.
"""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class KeyValue(BaseModel):
    label: str
    value: str


class PdfMetadata(BaseModel):
    name: str
    gender: Optional[str] = None
    dob: str = Field(..., description="Date of birth as shown, e.g. 06-10-2004")
    tob: str = Field(..., description="Time of birth as shown, e.g. 12:32:00 AM")
    pob: str = Field(..., description="Place of birth")
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    timezone: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    report_date: Optional[str] = None
    report_title_ta: Optional[str] = None
    report_title_en: Optional[str] = None


class ChartGrid(BaseModel):
    """cells: sign number "1".."12" (1 = Mesham) -> labels to print in that house."""
    title: str
    cells: Dict[str, List[str]]
    center_note: Optional[str] = None
    lagna_sign: Optional[int] = Field(default=None, ge=1, le=12)


class SimpleTable(BaseModel):
    title: str
    columns: List[str]
    rows: List[List[str]]
    widths: Optional[List[float]] = None   # percentages, summing to ~100
    highlight_columns: List[int] = []      # 0-based columns tinted with the accent colour
    group_header: List[List[Any]] = []      # optional first header row: [[label, colspan], ...]


class BhuktiRow(BaseModel):
    lord: str
    end: str
    age: Optional[str] = None   # "Y M D"


class DasaBlock(BaseModel):
    lord: str
    years: Optional[int] = None
    start: str
    end: str
    bhuktis: List[BhuktiRow] = []


class TextSection(BaseModel):
    title: str
    paragraphs: List[str]


class ChartSet(BaseModel):
    """A titled group of charts printed together (e.g. the 16 varga charts)."""
    title: str
    charts: List[ChartGrid]
    small: bool = False


class PdfTheme(BaseModel):
    """The Jathagam colour / Tamil-style panel choice, applied to the PDF."""
    ink: str = "#2B1B12"
    ink_soft: str = "#6B5B45"
    accent: str = "#800000"
    accent_deep: str = "#5A0000"
    gold: str = "#D4AF37"
    navy: str = "#1A365D"
    paper: str = "#FDF6E2"
    paper_card: str = "#FFFBEF"
    font_id: str = "noto-sans"


class KanithaData(BaseModel):
    basic_details: List[KeyValue]
    bio_data: List[KeyValue] = []
    planets: Optional[SimpleTable] = None
    charts: List[ChartGrid] = []
    dasa_balance: Optional[str] = None
    dashas: List[DasaBlock] = []
    extra_tables: List[SimpleTable] = []
    chart_sets: List[ChartSet] = []
    text_sections: List[TextSection] = []
    # Kalai order of sections after the planets page: [{"kind": "dasa"|"table"|"charts"|"text", "data": {...}}]
    ordered: List[Dict[str, Any]] = []
    notes: List[KeyValue] = []


class KpRow(BaseModel):
    name: str
    dms: str
    sign_lord: str
    star_lord: str
    sub_lord: str
    subsub_lord: str


class KpSignificator(BaseModel):
    planet: str
    by_star: str
    by_sub: str
    aspected_by: Optional[str] = None


class KpData(BaseModel):
    basic_details: List[KeyValue]
    charts: List[ChartGrid] = []
    bio_data: List[KeyValue] = []
    ayanamsa: Optional[str] = None
    planets: List[KpRow]
    cusps: List[KpRow]
    significators: List[KpSignificator] = []
    dasa_balance: Optional[str] = None
    dashas: List[DasaBlock] = []
    extra_tables: List[SimpleTable] = []


class PoruthamRow(BaseModel):
    name: str
    girl_value: str = ""
    boy_value: str = ""
    max_points: float
    points: float
    status: Literal["matched", "partial", "not_matched"]
    result_text: Optional[str] = None


class PersonSummary(BaseModel):
    title: str
    details: List[KeyValue]
    charts: List[ChartGrid] = []


class PoruthamData(BaseModel):
    girl: PersonSummary
    boy: PersonSummary
    rows: List[PoruthamRow]
    total_points: float
    max_points: float
    percent: float
    verdict: str
    extra_checks: List[KeyValue] = []


class NameRow(BaseModel):
    name_en: str
    name_ta: Optional[str] = None
    total: int


class NumberMeaning(BaseModel):
    number: int
    title: str
    text: str


class BabyData(BaseModel):
    sex: str
    birth_date: str
    star: Optional[str] = None
    star_letters: Optional[str] = None
    date_number: int
    destiny_number: int
    allowed_numbers: List[int]
    initials: Optional[str] = None
    number_meanings: List[NumberMeaning] = []
    names: List[NameRow]
    letter_values: Dict[str, int] = {}


class PdfRequest(BaseModel):
    feature_type: Literal["kanitha_jathagam", "kp_jathagam", "thirumana_porutham", "baby_numerology"]
    god_image: Literal["ganesha", "murugan", "om"] = "ganesha"
    language: Literal["ta", "en"] = "ta"
    chart_style: Literal["south", "north"] = "south"
    # A4 (default) or A5 — the A5 book uses the same layout, scaled to the A5 sheet (render.render_pdf)
    page_size: Literal["A4", "A5"] = "A4"
    theme: PdfTheme = PdfTheme()
    metadata: PdfMetadata
    feature_data: Dict[str, Any]

    def parsed_data(self) -> Union[KanithaData, KpData, PoruthamData, BabyData]:
        """Validate feature_data against the schema of this feature_type."""
        model = {"kanitha_jathagam": KanithaData, "kp_jathagam": KpData,
                 "thirumana_porutham": PoruthamData, "baby_numerology": BabyData}[self.feature_type]
        return model.model_validate(self.feature_data)
