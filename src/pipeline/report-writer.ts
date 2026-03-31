import { reasonCodeDescriptions } from "@/screening/reason-codes";
import { formatCurrency, formatPercent, markdownTable } from "@/lib/markdown";
import type { CompanyRecord } from "@/ingest/types";
import type { DeterministicSummary, ReasonCode, ScreeningReport, StrategicFitOutput } from "@/lib/types";

export function buildScreeningReport(params: {
  report_id: string;
  run_date: string;
  company: CompanyRecord;
  deterministic: DeterministicSummary;
  strategic: StrategicFitOutput | null;
  final_decision: "advance" | "reject";
  final_reason_codes: ReasonCode[];
}): { report: ScreeningReport; markdown: string } {
  const { report_id, run_date, company, deterministic, strategic, final_decision, final_reason_codes } = params;

  const report: ScreeningReport = {
    report_id,
    run_date,
    company_id: company.company_id,
    company_name: company.company_name,
    final_decision,
    final_reason_codes,
    deterministic_result: {
      passed_screen: deterministic.passed_screen,
      borderline: deterministic.borderline,
      metrics: deterministic.metrics,
      threshold_results: deterministic.threshold_results,
    },
    strategic_result: strategic,
    audit_trail: {
      data_sources: [...company.source_financials, ...company.source_product, ...company.source_market],
      completeness_score: deterministic.metrics.screening_completeness_score,
      agent_invoked: Boolean(strategic),
    },
  };

  const thresholdRows = markdownTable(
    Object.entries(deterministic.threshold_results).map(([field, status]) => {
      const value = deterministic.metrics[field as keyof typeof deterministic.metrics];
      const display =
        typeof value === "number"
          ? field.includes("usd")
            ? formatCurrency(value)
            : `${value}`
          : String(value ?? "n/a");
      return [field, display, status];
    }),
  );

  const markdown = `# M&A Screening Report - ${company.company_name}

## Company snapshot
- **Company ID:** ${company.company_id}
- **Category:** ${company.industry_category}
- **Sales motion:** ${company.sales_motion}
- **Product summary:** ${company.product_summary}
- **Customer summary:** ${company.customer_summary}

## Deterministic financial screen
- **Revenue:** ${formatCurrency(company.annual_revenue_usd)}
- **Growth:** ${formatPercent(company.revenue_growth_yoy_pct)}
- **Gross margin:** ${formatPercent(company.gross_margin_pct)}
- **Burn multiple:** ${company.burn_multiple ?? "n/a"}
- **Net retention:** ${formatPercent(company.net_retention_pct)}
- **Runway:** ${company.cash_months_remaining ?? "n/a"} months
- **Debt to revenue:** ${company.debt_to_revenue_ratio ?? "n/a"}
- **Revenue band:** ${deterministic.metrics.revenue_scale_band}
- **Growth efficiency:** ${deterministic.metrics.growth_efficiency_score ?? "n/a"}
- **Completeness:** ${deterministic.metrics.screening_completeness_score}

## Threshold result table
${thresholdRows}

## Strategic fit assessment
${strategic ? `- **Strategic fit score:** ${strategic.strategic_fit_score}/5
- **Confidence:** ${strategic.confidence}
- **Primary theme:** ${strategic.primary_theme}
- **Distribution fit:** ${strategic.distribution_fit}
- **Product surface synergy:** ${strategic.product_surface_synergy}
- **Integration complexity:** ${strategic.integration_complexity}
- **Rationale:** ${strategic.fit_rationale}
- **Major risks:** ${strategic.major_risks.join("; ") || "None recorded"}` : "- Agent not invoked because deterministic screen failed."}

## Final decision
- **Decision:** ${final_decision}

## Reason codes
${final_reason_codes.map((code) => `- **${code}**: ${reasonCodeDescriptions[code] ?? "No description available."}`).join("\n")}

## Audit notes
- **Run date:** ${run_date}
- **Agent invoked:** ${strategic ? "yes" : "no"}
- **Data sources:** ${report.audit_trail.data_sources.join(", ")}
${company.financial_as_of ? `- **Financials as of:** ${company.financial_as_of}` : ""}
${company.financial_provenance && Object.keys(company.financial_provenance).length > 0 ? `- **Financial provenance:** ${Object.entries(company.financial_provenance).map(([metric, note]) => `${metric}: ${note}`).join(" | ")}` : ""}
`;

  return { report, markdown };
}
