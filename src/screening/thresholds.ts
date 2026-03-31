import type { CompanyRecord } from "@/ingest/types";
import type { DeterministicReasonCode, ThresholdStatus } from "@/lib/types";
import { computeMetrics } from "@/screening/metrics";

type ThresholdEvaluation = {
  threshold_results: Record<string, ThresholdStatus>;
  fail_codes: DeterministicReasonCode[];
  borderline_codes: DeterministicReasonCode[];
  metrics: ReturnType<typeof computeMetrics>;
};

export function evaluateThresholds(company: CompanyRecord): ThresholdEvaluation {
  const metrics = computeMetrics(company);
  const threshold_results: Record<string, ThresholdStatus> = {};
  const fail_codes: DeterministicReasonCode[] = [];
  const borderline_codes: DeterministicReasonCode[] = [];

  const mark = (key: string, status: ThresholdStatus) => {
    threshold_results[key] = status;
  };

  const rejectIf = (condition: boolean, key: string, code: DeterministicReasonCode) => {
    if (condition) {
      mark(key, "fail");
      fail_codes.push(code);
    }
  };

  rejectIf((company.annual_revenue_usd ?? 0) < 5000000, "annual_revenue_usd", "REV_TOO_SMALL");
  rejectIf((company.revenue_growth_yoy_pct ?? 0) < 15, "revenue_growth_yoy_pct", "GROWTH_TOO_LOW");
  rejectIf((company.gross_margin_pct ?? 0) < 50, "gross_margin_pct", "MARGIN_TOO_LOW");
  rejectIf((company.cash_months_remaining ?? 0) < 6, "cash_months_remaining", "RUNWAY_TOO_SHORT");
  rejectIf((company.burn_multiple ?? Number.POSITIVE_INFINITY) > 3, "burn_multiple", "BURN_TOO_HIGH");
  rejectIf((company.net_retention_pct ?? 0) < 100, "net_retention_pct", "RETENTION_TOO_WEAK");
  rejectIf(metrics.screening_completeness_score < 0.7, "screening_completeness_score", "DATA_INCOMPLETE");

  if (company.debt_to_revenue_ratio !== null && company.debt_to_revenue_ratio > 1) {
    mark("debt_to_revenue_ratio", "fail");
    fail_codes.push("LEVERAGE_TOO_HIGH");
  }

  if (fail_codes.length === 0) {
    const borderline =
      (company.annual_revenue_usd ?? 0) < 10000000 ||
      (company.revenue_growth_yoy_pct ?? 0) < 25 ||
      (company.gross_margin_pct ?? 0) < 60 ||
      (company.net_retention_pct ?? 0) < 110 ||
      (company.cash_months_remaining ?? 0) < 12 ||
      ((company.debt_to_revenue_ratio ?? 0) >= 0.75 && (company.debt_to_revenue_ratio ?? 0) <= 1);

    if (borderline) {
      borderline_codes.push("BORDERLINE_FINANCIAL_PROFILE");
    }
  }

  if (!("annual_revenue_usd" in threshold_results)) {
    mark(
      "annual_revenue_usd",
      (company.annual_revenue_usd ?? 0) < 10000000 ? "borderline" : "pass",
    );
  }
  if (!("revenue_growth_yoy_pct" in threshold_results)) {
    mark(
      "revenue_growth_yoy_pct",
      (company.revenue_growth_yoy_pct ?? 0) < 25 ? "borderline" : "pass",
    );
  }
  if (!("gross_margin_pct" in threshold_results)) {
    mark("gross_margin_pct", (company.gross_margin_pct ?? 0) < 60 ? "borderline" : "pass");
  }
  if (!("net_retention_pct" in threshold_results)) {
    mark("net_retention_pct", (company.net_retention_pct ?? 0) < 110 ? "borderline" : "pass");
  }
  if (!("cash_months_remaining" in threshold_results)) {
    mark("cash_months_remaining", (company.cash_months_remaining ?? 0) < 12 ? "borderline" : "pass");
  }
  if (!("burn_multiple" in threshold_results)) {
    mark("burn_multiple", (company.burn_multiple ?? Number.POSITIVE_INFINITY) <= 2 ? "pass" : "borderline");
  }
  if (!("screening_completeness_score" in threshold_results)) {
    mark("screening_completeness_score", metrics.screening_completeness_score >= 0.85 ? "pass" : "borderline");
  }
  if (!("debt_to_revenue_ratio" in threshold_results)) {
    mark(
      "debt_to_revenue_ratio",
      company.debt_to_revenue_ratio !== null &&
        company.debt_to_revenue_ratio >= 0.75 &&
        company.debt_to_revenue_ratio <= 1
        ? "borderline"
        : "pass",
    );
  }

  return {
    threshold_results,
    fail_codes,
    borderline_codes,
    metrics,
  };
}
