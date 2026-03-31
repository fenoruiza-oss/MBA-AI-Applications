import { promises as fs } from "node:fs";
import path from "node:path";
import { assessStrategicFit } from "@/agents/strategic-fit";
import { upsertTarget, insertScreeningRun, listScreeningRuns } from "@/db/queries";
import { getEnrichmentMode, getSeedDatasetMode, getSeedTargets } from "@/ingest/datasets";
import { normalizeCompanies } from "@/ingest/normalize";
import type { CompanyRecord } from "@/ingest/types";
import type { ScreeningRunResult, StrategicFitInput } from "@/lib/types";
import { buildScreeningReport } from "@/pipeline/report-writer";
import { finalizeDecision } from "@/pipeline/decision";
import { routeCompany } from "@/screening/router";
import { salesforceStrategicThemes } from "@/screening/salesforce-strategy";

export async function buildStrategicInput(company: CompanyRecord, deterministic = routeCompany(company)): Promise<StrategicFitInput> {
  return {
    company_id: company.company_id,
    company_name: company.company_name,
    product_summary: company.product_summary,
    customer_summary: company.customer_summary,
    industry_category: company.industry_category,
    sales_motion: company.sales_motion,
    deterministic_summary: {
      passed_screen: deterministic.passed_screen,
      borderline: deterministic.borderline,
      key_metrics: {
        annual_revenue_usd: company.annual_revenue_usd,
        revenue_growth_yoy_pct: company.revenue_growth_yoy_pct,
        gross_margin_pct: company.gross_margin_pct,
        burn_multiple: company.burn_multiple,
        net_retention_pct: company.net_retention_pct,
        cash_months_remaining: company.cash_months_remaining,
      },
      caution_codes: deterministic.reason_codes,
    },
    salesforce_strategy_context: {
      themes: [...salesforceStrategicThemes],
      target_org: "Salesforce Corporate Development",
      instruction: "Assess only strategic fit. Do not recalculate metrics or make final decision.",
    },
  };
}

export async function runScreeningBatch(companies?: CompanyRecord[]): Promise<ScreeningRunResult[]> {
  const normalized = normalizeCompanies(companies ?? (await getSeedTargets()));
  const runDate = new Date().toISOString().slice(0, 10);
  const results: ScreeningRunResult[] = [];

  for (const company of normalized) {
    await upsertTarget(company);
    const deterministic = routeCompany(company);
    const strategic = deterministic.should_run_agent
      ? await assessStrategicFit(await buildStrategicInput(company, deterministic))
      : null;
    const decision = finalizeDecision(deterministic, strategic);
    const reportId = `${runDate}-${company.company_id}`;
    const reportPath = path.join(process.cwd(), "reports", "screening", `${reportId}.md`);
    const { report, markdown } = buildScreeningReport({
      report_id: reportId,
      run_date: runDate,
      company,
      deterministic,
      strategic,
      final_decision: decision.final_decision,
      final_reason_codes: decision.final_reason_codes,
    });

    await fs.writeFile(reportPath, markdown, "utf8");

    const result: ScreeningRunResult = {
      company,
      deterministic,
      strategic,
      final_decision: decision.final_decision,
      final_reason_codes: decision.final_reason_codes,
      report,
      report_markdown: markdown,
      report_path: reportPath,
      run_date: runDate,
    };

    await insertScreeningRun(result);
    results.push(result);
  }

  return results;
}

export async function ensureSeededRuns() {
  const existing = await listScreeningRuns();
  const targetIds = new Set((await getSeedTargets()).map((company) => company.company_id));
  const currentDatasetRuns = existing.filter((run) => targetIds.has(run.company_id));

  if (existing.length === 0 || currentDatasetRuns.length === 0) {
    await runScreeningBatch();
  }
}

async function main() {
  const results = await runScreeningBatch();
  console.log(JSON.stringify(results.map((result) => ({
    dataset_mode: getSeedDatasetMode(),
    enrichment_mode: getEnrichmentMode(),
    company_id: result.company.company_id,
    company_name: result.company.company_name,
    final_decision: result.final_decision,
    reason_codes: result.final_reason_codes,
  })), null, 2));
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
