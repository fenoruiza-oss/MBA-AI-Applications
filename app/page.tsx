import Link from "next/link";
import { ensureSeededRuns } from "@/pipeline/run-screening";
import { listScreeningRuns } from "@/db/queries";

export const dynamic = "force-dynamic";

function decisionCount(runs: Awaited<ReturnType<typeof listScreeningRuns>>, value: "advance" | "reject") {
  return runs.filter((run) => run.final_decision === value).length;
}

export default async function HomePage() {
  await ensureSeededRuns();
  const runs = await listScreeningRuns();

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">Salesforce Corporate Development</span>
        <h1>M&A Screening and Judgment System</h1>
        <p>
          Deterministic financial screening does the heavy lifting. Only threshold-passing targets reach a narrow
          strategic-fit agent, and every decision is stored with structured reason codes and a Markdown report.
        </p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span className="stat-label">Targets screened</span>
          <strong className="stat-value">{runs.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Advance</span>
          <strong className="stat-value">{decisionCount(runs, "advance")}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Reject</span>
          <strong className="stat-value">{decisionCount(runs, "reject")}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Agent reviewed</span>
          <strong className="stat-value">{runs.filter((run) => run.report.audit_trail.agent_invoked).length}</strong>
        </article>
      </section>

      <section className="layout">
        <div className="panel">
          <h2>Latest screening runs</h2>
          <div className="list">
            {runs.map((run) => (
              <Link href={`/targets/${run.company_id}`} className="target-card" key={run.report_id}>
                <div className="row">
                  <div>
                    <h3>{run.company_name}</h3>
                    <p className="muted">{run.run_date}</p>
                  </div>
                  <span className={`pill ${run.final_decision}`}>{run.final_decision}</span>
                </div>
                <div className="reason-list">
                  {run.final_reason_codes.map((code) => (
                    <span className="reason" key={code}>
                      {code}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h2>System design</h2>
          <p className="muted">
            The deterministic router handles calculations, thresholds, routing, and reason codes. The agent only
            interprets strategic fit against Salesforce themes.
          </p>
          <table className="table">
            <tbody>
              <tr>
                <th>Data source</th>
                <td>Hand-built sample target set</td>
              </tr>
              <tr>
                <th>Storage</th>
                <td>SQLite via sql.js</td>
              </tr>
              <tr>
                <th>Reports</th>
                <td>Markdown artifacts in `reports/screening`</td>
              </tr>
              <tr>
                <th>Agent model</th>
                <td>`gpt-5.4-nano` with mock fallback when no API key is present</td>
              </tr>
            </tbody>
          </table>
        </aside>
      </section>
    </main>
  );
}
