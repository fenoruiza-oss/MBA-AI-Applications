import type { DeterministicSummary, ReasonCode, StrategicFitOutput } from "@/lib/types";

export function mapStrategicReasonCodes(strategic: StrategicFitOutput | null): ReasonCode[] {
  if (!strategic) {
    return [];
  }

  const codes: ReasonCode[] = [];

  if (strategic.strategic_fit_score < 4 || strategic.recommendation === "reject") {
    codes.push("NO_STRATEGIC_FIT");
  }
  if (strategic.distribution_fit === "low") {
    codes.push("WEAK_SALESFORCE_CHANNEL_FIT");
  }
  if (strategic.primary_theme === "none") {
    codes.push("OVERLAP_TOO_DISTANT");
  }
  if (strategic.product_surface_synergy === "low") {
    codes.push("PRODUCT_SURFACE_WEAK");
  }

  return [...new Set(codes)];
}

export function finalizeDecision(deterministic: DeterministicSummary, strategic: StrategicFitOutput | null) {
  if (!deterministic.passed_screen) {
    return {
      final_decision: "reject" as const,
      final_reason_codes: deterministic.reason_codes,
    };
  }

  const strategicCodes = mapStrategicReasonCodes(strategic);
  const advance =
    strategic &&
    strategic.strategic_fit_score >= 4 &&
    strategic.distribution_fit !== "low" &&
    strategic.product_surface_synergy !== "low" &&
    strategic.confidence >= 0.6;

  return {
    final_decision: advance ? ("advance" as const) : ("reject" as const),
    final_reason_codes: [...new Set([...deterministic.reason_codes, ...strategicCodes])],
  };
}
