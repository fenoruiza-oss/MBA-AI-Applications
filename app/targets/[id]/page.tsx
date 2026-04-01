import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSeededRuns } from "@/pipeline/run-screening";
import { getScreeningRun } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function TargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureSeededRuns();
  const run = await getScreeningRun(id);

  if (!run) {
    notFound();
  }

  return (
    <main className="shell">
      <div className="hero">
        <span className="eyebrow">Target Detail</span>
        <h1>{run.company_name}</h1>
        <p>
          <Link href="/">Back to dashboard</Link>
        </p>
      </div>

      <section className="detail-grid">
        <div className="panel">
          <div className="row">
            <h2>Decision summary</h2>
            <span className={`pill ${run.final_decision}`}>{run.final_decision}</span>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span>Revenue</span>
              <strong>${Number(run.company.annual_revenue_usd ?? 0).toLocaleString()}</strong>
            </div>
            <div className="metric">
              <span>Growth</span>
              <strong>{run.company.revenue_growth_yoy_pct ?? "n/a"}%</strong>
            </div>
            <div className="metric">
              <span>Gross margin</span>
              <strong>{run.company.gross_margin_pct ?? "n/a"}%</strong>
            </div>
            <div className="metric">
              <span>NRR</span>
              <strong>{run.company.net_retention_pct ?? "n/a"}%</strong>
            </div>
            <div className="metric">
              <span>Runway</span>
              <strong>{run.company.cash_months_remaining ?? "n/a"} months</strong>
            </div>
            <div className="metric">
              <span>Theme</span>
              <strong>{run.strategic?.primary_theme ?? "not evaluated"}</strong>
            </div>
          </div>

          <h3>Reason codes</h3>
          <div className="reason-list">
            {run.final_reason_codes.map((code) => (
              <span key={code} className="reason">
                {code}
              </span>
            ))}
          </div>

          <h3>Threshold results</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(run.deterministic.threshold_results).map(([field, status]) => (
                <tr key={field}>
                  <td>{field}</td>
                  <td>{String(status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Markdown report</h2>
          <div className="markdown">{run.report_markdown}</div>
        </div>
      </section>
    </main>
  );
}
