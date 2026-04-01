import type { CompanyRecord } from "@/ingest/types";

export type RevenueScaleBand = "<10M" | "10-25M" | "25-75M" | "75M+";
export type HealthFlag = "healthy" | "watch" | "risky" | "unknown";
export type ThresholdStatus = "pass" | "fail" | "borderline";
export type FinalDecision = "advance" | "reject";
export type PrimaryTheme =
  | "ai_workflow"
  | "crm_adjacency"
  | "service_ops"
  | "developer_tooling"
  | "vertical_saas"
  | "none";
export type FitLevel = "high" | "medium" | "low";
export type ComplexityLevel = "low" | "medium" | "high";

export type DeterministicReasonCode =
  | "REV_TOO_SMALL"
  | "GROWTH_TOO_LOW"
  | "MARGIN_TOO_LOW"
  | "BURN_TOO_HIGH"
  | "RETENTION_TOO_WEAK"
  | "RUNWAY_TOO_SHORT"
  | "LEVERAGE_TOO_HIGH"
  | "DATA_INCOMPLETE"
  | "BORDERLINE_FINANCIAL_PROFILE";

export type StrategicReasonCode =
  | "NO_STRATEGIC_FIT"
  | "WEAK_SALESFORCE_CHANNEL_FIT"
  | "OVERLAP_TOO_DISTANT"
  | "PRODUCT_SURFACE_WEAK";

export type ReasonCode = DeterministicReasonCode | StrategicReasonCode;

export type ComputedMetrics = {
  revenue_scale_band: RevenueScaleBand;
  growth_efficiency_score: number | null;
  margin_health_flag: HealthFlag;
  retention_health_flag: HealthFlag;
  runway_flag: HealthFlag;
  leverage_flag: HealthFlag;
  screening_completeness_score: number;
};

export type DeterministicSummary = {
  passed_screen: boolean;
  borderline: boolean;
  should_run_agent: boolean;
  threshold_results: Record<string, ThresholdStatus>;
  reason_codes: ReasonCode[];
  metrics: ComputedMetrics & {
    annual_revenue_usd: number | null;
    revenue_growth_yoy_pct: number | null;
    gross_margin_pct: number | null;
    burn_multiple: number | null;
    net_retention_pct: number | null;
    cash_months_remaining: number | null;
    debt_to_revenue_ratio: number | null;
  };
};

export type StrategicFitInput = {
  company_id: string;
  company_name: string;
  headquarters: string | null;
  product_summary: string;
  customer_summary: string;
  industry_category: CompanyRecord["industry_category"];
  sales_motion: CompanyRecord["sales_motion"];
  deterministic_summary: {
    passed_screen: boolean;
    borderline: boolean;
    key_metrics: {
      annual_revenue_usd: number | null;
      revenue_growth_yoy_pct: number | null;
      gross_margin_pct: number | null;
      burn_multiple: number | null;
      net_retention_pct: number | null;
      cash_months_remaining: number | null;
    };
    caution_codes: string[];
  };
  salesforce_strategy_context: {
    themes: string[];
    target_org: "Salesforce Corporate Development";
    instruction: "Assess only strategic fit. Do not recalculate metrics or make final decision.";
  };
};

export type StrategicFitOutput = {
  strategic_fit_score: number;
  confidence: number;
  primary_theme: PrimaryTheme;
  secondary_themes: string[];
  fit_rationale: string;
  distribution_fit: FitLevel;
  product_surface_synergy: FitLevel;
  integration_complexity: ComplexityLevel;
  major_risks: string[];
  recommendation: FinalDecision;
};

export type ScreeningReport = {
  report_id: string;
  run_date: string;
  company_id: string;
  company_name: string;
  final_decision: FinalDecision;
  final_reason_codes: ReasonCode[];
  deterministic_result: {
    passed_screen: boolean;
    borderline: boolean;
    metrics: Record<string, number | string | null>;
    threshold_results: Record<string, ThresholdStatus>;
  };
  strategic_result: StrategicFitOutput | null;
  audit_trail: {
    data_sources: string[];
    completeness_score: number;
    agent_invoked: boolean;
  };
};

export type ScreeningRunResult = {
  company: CompanyRecord;
  deterministic: DeterministicSummary;
  strategic: StrategicFitOutput | null;
  final_decision: FinalDecision;
  final_reason_codes: ReasonCode[];
  report: ScreeningReport;
  report_markdown: string;
  report_path: string;
  run_date: string;
};
