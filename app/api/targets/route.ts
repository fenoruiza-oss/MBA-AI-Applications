import { NextResponse } from "next/server";
import { ensureSeededRuns } from "@/pipeline/run-screening";
import { listScreeningRuns } from "@/db/queries";

export async function GET() {
  await ensureSeededRuns();
  const runs = await listScreeningRuns();
  return NextResponse.json(runs);
}
