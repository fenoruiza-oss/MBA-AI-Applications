import { describe, expect, it } from "vitest";
import { buildScreeningReport } from "@/pipeline/report-writer";
import { sampleTargets } from "@/ingest/sample-targets";
import { routeCompany } from "@/screening/router";

describe("buildScreeningReport", () => {
  it("includes all required markdown sections", () => {
    const company = sampleTargets[0];
    const deterministic = routeCompany(company);
    const { markdown } = buildScreeningReport({
      report_id: "2026-03-30-agentflow-systems",
      run_date: "2026-03-30",
      company,
      deterministic,
      strategic: {
        strategic_fit_score: 4,
        confidence: 0.7,
        primary_theme: "ai_workflow",
        secondary_themes: ["crm_adjacency"],
        fit_rationale: "Good strategic fit.",
        distribution_fit: "high",
        product_surface_synergy: "high",
        integration_complexity: "low",
        major_risks: ["Integration assumptions"],
        recommendation: "advance",
      },
      final_decision: "advance",
      final_reason_codes: deterministic.reason_codes,
    });

    expect(markdown).toContain("## Company snapshot");
    expect(markdown).toContain("## Deterministic financial screen");
    expect(markdown).toContain("## Threshold result table");
    expect(markdown).toContain("## Strategic fit assessment");
    expect(markdown).toContain("## Final decision");
    expect(markdown).toContain("## Reason codes");
    expect(markdown).toContain("## Audit notes");
  });
});
