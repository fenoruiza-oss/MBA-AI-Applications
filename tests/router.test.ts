import { describe, expect, it } from "vitest";
import { routeCompany } from "@/screening/router";
import { sampleTargets } from "@/ingest/sample-targets";

describe("routeCompany", () => {
  it("rejects targets that fail hard thresholds", () => {
    const result = routeCompany(sampleTargets[5]);
    expect(result.passed_screen).toBe(false);
    expect(result.should_run_agent).toBe(false);
    expect(result.reason_codes).toContain("REV_TOO_SMALL");
  });

  it("flags borderline targets for agent review", () => {
    const result = routeCompany(sampleTargets[2]);
    expect(result.passed_screen).toBe(true);
    expect(result.borderline).toBe(true);
    expect(result.should_run_agent).toBe(true);
    expect(result.reason_codes).toContain("BORDERLINE_FINANCIAL_PROFILE");
  });
});
