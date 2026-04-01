import { getMemoryRun, insertMemoryRun, listMemoryRuns, upsertMemoryTarget } from "@/db/memory-store";
import { getSupabaseClient } from "@/db/supabase";
import type { CompanyRecord } from "@/ingest/types";
import type { ScreeningRunResult } from "@/lib/types";

type SupabaseTargetRow = {
  company_id: string;
  company_name: string;
  payload_json: CompanyRecord;
  created_at: string;
};

type SupabaseRunRow = {
  report_id: string;
  company_id: string;
  run_date: string;
  final_decision: "advance" | "reject";
  report_path: string;
  report_markdown: string;
  deterministic_json: ScreeningRunResult["deterministic"];
  strategic_json: ScreeningRunResult["strategic"];
  final_reason_codes_json: string[];
  report_json: ScreeningRunResult["report"];
};

function requireData<T>(data: T | null, error: { message?: string } | null) {
  if (error) {
    throw new Error(error.message ?? "Supabase query failed.");
  }
  if (data === null) {
    throw new Error("Supabase query returned no data.");
  }
  return data;
}

export async function upsertTarget(company: CompanyRecord) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    upsertMemoryTarget(company);
    return;
  }

  const { error } = await supabase.from("targets").upsert(
    {
      company_id: company.company_id,
      company_name: company.company_name,
      payload_json: company,
      created_at: company.collected_at,
    },
    { onConflict: "company_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertScreeningRun(result: ScreeningRunResult) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    insertMemoryRun(result);
    return;
  }

  const { error } = await supabase.from("screening_runs").upsert(
    {
      report_id: result.report.report_id,
      company_id: result.company.company_id,
      run_date: result.run_date,
      final_decision: result.final_decision,
      report_path: result.report_path,
      report_markdown: result.report_markdown,
      deterministic_json: result.deterministic,
      strategic_json: result.strategic,
      final_reason_codes_json: result.final_reason_codes,
      report_json: result.report,
    },
    { onConflict: "report_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function listScreeningRuns() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return listMemoryRuns();
  }

  const [targetsResponse, runsResponse] = await Promise.all([
    supabase.from("targets").select("company_id, company_name, payload_json, created_at"),
    supabase
      .from("screening_runs")
      .select(
        "report_id, company_id, run_date, final_decision, report_path, report_markdown, deterministic_json, strategic_json, final_reason_codes_json, report_json",
      )
      .order("run_date", { ascending: false }),
  ]);

  const targets = requireData(targetsResponse.data as SupabaseTargetRow[] | null, targetsResponse.error);
  const runs = requireData(runsResponse.data as SupabaseRunRow[] | null, runsResponse.error);
  const targetMap = new Map(targets.map((target) => [target.company_id, target]));

  return runs.map((run) => ({
    report_id: run.report_id,
    company_id: run.company_id,
    company_name: targetMap.get(run.company_id)?.company_name ?? run.company_id,
    run_date: run.run_date,
    final_decision: run.final_decision,
    report_path: run.report_path,
    report_markdown: run.report_markdown,
    final_reason_codes: run.final_reason_codes_json,
    report: run.report_json,
  }));
}

export async function getScreeningRun(companyId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getMemoryRun(companyId);
  }

  const [targetResponse, runResponse] = await Promise.all([
    supabase.from("targets").select("company_id, company_name, payload_json, created_at").eq("company_id", companyId).single(),
    supabase
      .from("screening_runs")
      .select(
        "report_id, company_id, run_date, final_decision, report_path, report_markdown, deterministic_json, strategic_json, final_reason_codes_json, report_json",
      )
      .eq("company_id", companyId)
      .order("run_date", { ascending: false })
      .limit(1)
      .single(),
  ]);

  if (targetResponse.error || runResponse.error) {
    if (targetResponse.error?.code === "PGRST116" || runResponse.error?.code === "PGRST116") {
      return null;
    }
    throw new Error(targetResponse.error?.message ?? runResponse.error?.message ?? "Supabase read failed.");
  }

  const target = targetResponse.data as SupabaseTargetRow;
  const run = runResponse.data as SupabaseRunRow;

  return {
    report_id: run.report_id,
    company_id: run.company_id,
    company_name: target.company_name,
    run_date: run.run_date,
    final_decision: run.final_decision,
    report_path: run.report_path,
    report_markdown: run.report_markdown,
    final_reason_codes: run.final_reason_codes_json,
    report: run.report_json,
    company: target.payload_json,
    deterministic: run.deterministic_json,
    strategic: run.strategic_json,
  };
}
