import { z } from "zod";
import { companyRecordSchema } from "@/ingest/types";

export const strategicFitOutputSchema = z.object({
  strategic_fit_score: z.number().min(1).max(5),
  confidence: z.number().min(0).max(1),
  primary_theme: z.enum([
    "ai_workflow",
    "crm_adjacency",
    "service_ops",
    "developer_tooling",
    "vertical_saas",
    "none",
  ]),
  secondary_themes: z.array(z.string()),
  fit_rationale: z.string(),
  distribution_fit: z.enum(["high", "medium", "low"]),
  product_surface_synergy: z.enum(["high", "medium", "low"]),
  integration_complexity: z.enum(["low", "medium", "high"]),
  major_risks: z.array(z.string()),
  recommendation: z.enum(["advance", "reject"]),
});

export const companyArraySchema = z.array(companyRecordSchema);
