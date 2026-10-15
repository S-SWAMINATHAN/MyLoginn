import type { TemplateId, TemplateOption } from "@/types/certificate";
import { TemplateClassic } from "./TemplateClassic";
import { TemplateGeometric } from "./TemplateGeometric";
import { TemplateModern } from "./TemplateModern";
import { TemplateTech } from "./TemplateTech";
import { TemplateWave } from "./TemplateWave";

export const TEMPLATES: readonly TemplateOption[] = [
  { id: "modern-executive", name: "Modern Executive", tagline: "Clean frame, elegant serif, metallic seal", palette: ["#1d3a7a", "#93b0e6", "#ffffff"], component: TemplateModern },
  { id: "tech-vanguard", name: "Tech Vanguard", tagline: "Deep navy with cyan circuit traces", palette: ["#08093f", "#1fe4f2", "#ffffff"], component: TemplateTech },
  { id: "classic-heritage", name: "Classic Heritage", tagline: "Gold foil, laurel wreath, formal serif", palette: ["#4a3f35", "#c39a45", "#ffffff"], component: TemplateClassic },
  { id: "ocean-wave", name: "Ocean Wave", tagline: "Flowing blue waves and silver mesh", palette: ["#23408f", "#4ea5dc", "#ffffff"], component: TemplateWave },
  { id: "bold-geometric", name: "Bold Geometric", tagline: "Marble paper with navy and cyan shards", palette: ["#0b2766", "#1aa6d1", "#eef0f3"], component: TemplateGeometric },
];

export const DEFAULT_TEMPLATE: TemplateId = "modern-executive";

export const getTemplate = (id: TemplateId) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const isTemplateId = (value: unknown): value is TemplateId => TEMPLATES.some((t) => t.id === value);
