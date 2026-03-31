import { describe, expect, it } from "vitest";
import { sampleTargets } from "@/ingest/sample-targets";
import { computeMetrics } from "@/screening/metrics";

describe("computeMetrics", () => {
  it("computes growth efficiency and revenue band", () => {
    const metrics = computeMetrics(sampleTargets[0]);
    expect(metrics.revenue_scale_band).toBe("10-25M");
    expect(metrics.growth_efficiency_score).toBeCloseTo(18.82, 2);
    expect(metrics.margin_health_flag).toBe("healthy");
  });

  it("marks leverage as watch near the caution band", () => {
    const metrics = computeMetrics(sampleTargets[3]);
    expect(metrics.leverage_flag).toBe("watch");
  });
});
