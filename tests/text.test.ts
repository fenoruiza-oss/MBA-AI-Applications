import { describe, expect, it } from "vitest";
import { normalizeStrategicFitOutput, normalizeTextForStorage } from "@/lib/text";

describe("normalizeTextForStorage", () => {
  it("replaces common mojibake and smart punctuation with ASCII-safe text", () => {
    expect(normalizeTextForStorage("Salesforceâ€™s workflowâ€”platform")).toBe("Salesforce's workflow-platform");
  });

  it("normalizes agent output fields recursively", () => {
    const output = normalizeStrategicFitOutput({
      strategic_fit_score: 4.6,
      confidence: 0.7,
      primary_theme: "ai_workflow",
      secondary_themes: ["crm_adjacency", "service_ops"],
      fit_rationale: "Zapierâ€™s orchestration layer strengthens Salesforceâ€™s automation story.",
      distribution_fit: "medium",
      product_surface_synergy: "high",
      integration_complexity: "medium",
      major_risks: ["Potential overlapâ€”needs positioning.", "Mixed motionâ€™s channel fit is uncertain."],
      recommendation: "advance",
    });

    expect(output.fit_rationale).toBe("Zapier's orchestration layer strengthens Salesforce's automation story.");
    expect(output.major_risks).toEqual([
      "Potential overlap-needs positioning.",
      "Mixed motion's channel fit is uncertain.",
    ]);
  });
});
