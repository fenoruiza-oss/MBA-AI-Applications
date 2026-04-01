import type { CompanyRecord } from "@/ingest/types";
import type { ScreeningRunResult } from "@/lib/types";

type StoredRun = {
  report_id: string;
  company_id: string;
  company_name: string;
  run_date: string;
  final_decision: "advance" | "reject";
  report_path: string;
  report_markdown: string;
  final_reason_codes: string[];
  report: ScreeningRunResult["report"];
  company: CompanyRecord;
  deterministic: ScreeningRunResult["deterministic"];
  strategic: ScreeningRunResult["strategic"];
};

const targets = new Map<string, CompanyRecord>();
const runs = new Map<string, StoredRun>();

export function upsertMemoryTarget(company: CompanyRecord) {
  targets.set(company.company_id, company);
}

export function insertMemoryRun(result: ScreeningRunResult) {
  runs.set(result.report.report_id, {
    report_id: result.report.report_id,
    company_id: result.company.company_id,
    company_name: result.company.company_name,
    run_date: result.run_date,
    final_decision: result.final_decision,
    report_path: result.report_path,
    report_markdown: result.report_markdown,
    final_reason_codes: result.final_reason_codes,
    report: result.report,
    company: result.company,
    deterministic: result.deterministic,
    strategic: result.strategic,
  });
}

export function listMemoryRuns() {
  return [...runs.values()].sort((a, b) => {
    if (a.run_date === b.run_date) {
      return a.company_name.localeCompare(b.company_name);
    }
    return b.run_date.localeCompare(a.run_date);
  });
}

export function getMemoryRun(companyId: string) {
  return listMemoryRuns().find((run) => run.company_id === companyId) ?? null;
}
