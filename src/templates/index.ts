import type { ComponentType } from "react";
import { ClassicTemplate } from "./classic/ClassicTemplate";
import type { TemplateProps } from "./types";

// Templates live in code; invitations store templateId + templateVersion. Adding a template
// means adding an entry here, with no database schema change.
export const templates = {
  classic: { name: "Classic", version: 1, Component: ClassicTemplate },
} satisfies Record<string, { name: string; version: number; Component: ComponentType<TemplateProps> }>;

export type TemplateId = keyof typeof templates;

export function getTemplate(templateId: string) {
  return templateId in templates ? templates[templateId as TemplateId] : null;
}
