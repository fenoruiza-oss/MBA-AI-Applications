import { NextResponse } from "next/server";
import { runScreeningBatch } from "@/pipeline/run-screening";

export async function POST() {
  const results = await runScreeningBatch();
  return NextResponse.json({
    run_count: results.length,
    decisions: results.map((result) => ({
      company_id: result.company.company_id,
      company_name: result.company.company_name,
      final_decision: result.final_decision,
      final_reason_codes: result.final_reason_codes,
    })),
  });
}
