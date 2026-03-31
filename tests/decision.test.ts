import { describe, expect, it } from "vitest";
import { routeCompany } from "@/screening/router";
import { sampleTargets } from "@/ingest/sample-targets";
import { finalizeDecision } from "@/pipeline/decision";

describe("finalizeDecision", () => {
  it("advances a financially strong target with strong strategic fit", () => {
    const deterministic = routeCompany(sampleTargets[0]);
    const decision = finalizeDecision(deterministic, {
      strategic_fit_score: 5,
      confidence: 0.8,
      primary_theme: "ai_workflow",
      secondary_themes: ["service_ops"],
      fit_rationale: "Strong fit.",
      distribution_fit: "high",
      product_surface_synergy: "high",
      integration_complexity: "low",
      major_risks: [],
      recommendation: "advance",
    });

    expect(decision.final_decision).toBe("advance");
  });

  it("rejects strategic weak fit even when deterministic screen passes", () => {
    const deterministic = routeCompany(sampleTargets[7]);
    const decision = finalizeDecision(deterministic, {
      strategic_fit_score: 2,
      confidence: 0.72,
      primary_theme: "none",
      secondary_themes: [],
      fit_rationale: "Weak Salesforce adjacency.",
      distribution_fit: "low",
      product_surface_synergy: "low",
      integration_complexity: "medium",
      major_risks: ["Weak GTM alignment"],
      recommendation: "reject",
    });

    expect(decision.final_decision).toBe("reject");
    expect(decision.final_reason_codes).toContain("NO_STRATEGIC_FIT");
    expect(decision.final_reason_codes).toContain("WEAK_SALESFORCE_CHANNEL_FIT");
  });
});
