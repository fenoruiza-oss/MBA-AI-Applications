import { z } from "zod";

export const ownershipTypeSchema = z.enum(["public", "private", "unknown"]);
export const industryCategorySchema = z.enum([
  "ai_workflow",
  "crm_adjacency",
  "service_ops",
  "developer_tooling",
  "vertical_saas",
  "other",
]);
export const salesMotionSchema = z.enum(["enterprise", "mid_market", "smb", "mixed", "unknown"]);

export const companyRecordSchema = z.object({
  company_id: z.string(),
  company_name: z.string(),
  website: z.string().nullable(),
  headquarters: z.string().nullable(),
  founding_year: z.number().int().nullable(),
  employee_count: z.number().int().nullable(),
  ownership_type: ownershipTypeSchema,
  industry_category: industryCategorySchema,
  product_summary: z.string(),
  customer_summary: z.string(),
  sales_motion: salesMotionSchema,
  annual_revenue_usd: z.number().nullable(),
  revenue_growth_yoy_pct: z.number().nullable(),
  gross_margin_pct: z.number().nullable(),
  burn_multiple: z.number().nullable(),
  net_retention_pct: z.number().nullable(),
  logo_churn_pct: z.number().nullable(),
  cash_months_remaining: z.number().nullable(),
  debt_to_revenue_ratio: z.number().nullable(),
  funding_stage: z.string().nullable(),
  total_funding_usd: z.number().nullable(),
  last_round_date: z.string().nullable(),
  last_round_post_money_usd: z.number().nullable(),
  source_financials: z.array(z.string()),
  source_product: z.array(z.string()),
  source_market: z.array(z.string()),
  financial_as_of: z.string().nullable().optional(),
  financial_provenance: z.record(z.string()).optional(),
  data_quality_flags: z.array(z.string()),
  collected_at: z.string(),
});

export type CompanyRecord = z.infer<typeof companyRecordSchema>;
