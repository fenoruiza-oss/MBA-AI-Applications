import type { CompanyRecord } from "@/ingest/types";
import type { DeterministicSummary } from "@/lib/types";
import { evaluateThresholds } from "@/screening/thresholds";

export function routeCompany(company: CompanyRecord): DeterministicSummary {
  const evaluation = evaluateThresholds(company);
  const passed_screen = evaluation.fail_codes.length === 0;
  const borderline = passed_screen && evaluation.borderline_codes.length > 0;

  return {
    passed_screen,
    borderline,
    should_run_agent: passed_screen,
    threshold_results: evaluation.threshold_results,
    reason_codes: [...evaluation.fail_codes, ...evaluation.borderline_codes],
    metrics: {
      annual_revenue_usd: company.annual_revenue_usd,
      revenue_growth_yoy_pct: company.revenue_growth_yoy_pct,
      gross_margin_pct: company.gross_margin_pct,
      burn_multiple: company.burn_multiple,
      net_retention_pct: company.net_retention_pct,
      cash_months_remaining: company.cash_months_remaining,
      debt_to_revenue_ratio: company.debt_to_revenue_ratio,
      ...evaluation.metrics,
    },
  };
}
