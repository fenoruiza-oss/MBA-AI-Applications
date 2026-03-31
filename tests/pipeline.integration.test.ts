import { describe, expect, it } from "vitest";
import { runScreeningBatch } from "@/pipeline/run-screening";
import { sampleTargets } from "@/ingest/sample-targets";

describe("runScreeningBatch", () => {
  it("runs an end-to-end screen across a small fixture set", async () => {
    const results = await runScreeningBatch(sampleTargets.slice(0, 3));
    expect(results).toHaveLength(3);
    expect(results.some((result) => result.final_decision === "advance")).toBe(true);
    expect(results.every((result) => result.report.report_id)).toBe(true);
  });
});
