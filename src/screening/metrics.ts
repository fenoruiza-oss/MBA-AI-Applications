import type { CompanyRecord } from "@/ingest/types";
import type { ComputedMetrics, HealthFlag, RevenueScaleBand } from "@/lib/types";

const requiredCompletenessFields: Array<keyof CompanyRecord> = [
  "annual_revenue_usd",
  "revenue_growth_yoy_pct",
  "gross_margin_pct",
  "burn_multiple",
  "net_retention_pct",
  "cash_months_remaining",
  "debt_to_revenue_ratio",
];

function revenueScaleBand(revenue: number | null): RevenueScaleBand {
  if (revenue === null || revenue < 10000000) {
    return "<10M";
  }
  if (revenue < 25000000) {
    return "10-25M";
  }
  if (revenue < 75000000) {
    return "25-75M";
  }
  return "75M+";
}

function toFlag(value: number | null, healthyThreshold: number, riskyThreshold?: number): HealthFlag {
  if (value === null) {
    return "unknown";
  }
  if (value >= healthyThreshold) {
    return "healthy";
  }
  if (typeof riskyThreshold === "number" && value < riskyThreshold) {
    return "risky";
  }
  return "watch";
}

export function computeScreeningCompletenessScore(company: CompanyRecord): number {
  const present = requiredCompletenessFields.filter((field) => company[field] !== null).length;
  return Number((present / requiredCompletenessFields.length).toFixed(2));
}

export function computeMetrics(company: CompanyRecord): ComputedMetrics {
  const completeness = computeScreeningCompletenessScore(company);

  return {
    revenue_scale_band: revenueScaleBand(company.annual_revenue_usd),
    growth_efficiency_score:
      company.revenue_growth_yoy_pct !== null && company.burn_multiple && company.burn_multiple > 0
        ? Number((company.revenue_growth_yoy_pct / company.burn_multiple).toFixed(2))
        : null,
    margin_health_flag: toFlag(company.gross_margin_pct, 60, 50),
    retention_health_flag: toFlag(company.net_retention_pct, 110, 100),
    runway_flag: toFlag(company.cash_months_remaining, 12, 6),
    leverage_flag:
      company.debt_to_revenue_ratio === null
        ? "unknown"
        : company.debt_to_revenue_ratio > 1
          ? "risky"
          : company.debt_to_revenue_ratio >= 0.75
            ? "watch"
            : "healthy",
    screening_completeness_score: completeness,
  };
}
