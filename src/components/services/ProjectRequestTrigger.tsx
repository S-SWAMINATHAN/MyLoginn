"use client";

import { Button } from "@/components/ui/Button";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";

export type ProjectRequestTriggerService = "web" | "mobile" | "software" | "marketing";

type ProjectRequestTriggerProps = {
  service: ProjectRequestTriggerService;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  className?: string;
};

export function ProjectRequestTrigger({
  service,
  label,
  variant = "outline",
  className,
}: ProjectRequestTriggerProps) {
  return (
    <Button type="button" onClick={() => openProjectRequest(service)} variant={variant} className={className}>
      {label}
    </Button>
  );
}
