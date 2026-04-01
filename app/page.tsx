import Link from "next/link";
import { ensureSeededRuns } from "@/pipeline/run-screening";
import { listScreeningRuns } from "@/db/queries";

export const dynamic = "force-dynamic";

function formatTheme(theme: string | null | undefined) {
  if (!theme || theme === "none") {
    return "No clear theme";
  }

  return theme
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDecisionLabel(value: "advance" | "reject") {
  return value === "advance" ? "Advance" : "Reject";
}

function formatReason(code: string) {
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function decisionCount(runs: Awaited<ReturnType<typeof listScreeningRuns>>, value: "advance" | "reject") {
  return runs.filter((run) => run.final_decision === value).length;
}

export default async function HomePage() {
  await ensureSeededRuns();
  const runs = await listScreeningRuns();
  const latestRun = runs[0];
  const agentReviewed = runs.filter((run) => run.report.audit_trail.agent_invoked).length;

  return (
    <main className="shell">
      <section className="hero-board">
        <div className="hero-copy panel panel-hero">
          <span className="eyebrow">Salesforce Corporate Development</span>
          <p className="hero-overline">Editorial Screening Ledger</p>
          <h1>M&A screening with boardroom discipline and narrow-model judgment.</h1>
          <p className="hero-summary">
            Financial screening stays deterministic. Only targets that clear the first gate reach a strategic-fit
            agent, and every disposition is stored with inspectable reason codes, report output, and audit context.
          </p>
          <div className="hero-highlights">
            <div>
              <span className="hero-label">Operating posture</span>
              <strong>Rule-first workflow control</strong>
            </div>
            <div>
              <span className="hero-label">Live board</span>
              <strong>{latestRun?.run_date ?? "No runs yet"}</strong>
            </div>
          </div>
        </div>

        <aside className="hero-side panel panel-hero-side">
          <span className="eyebrow">Current screen</span>
          <h2>Decision mix</h2>
          <p className="muted">
            The front page behaves like an internal review board: one pass of deterministic screening, one narrow
            strategic review, one stored decision.
          </p>
          <div className="hero-side-metrics">
            <div className="mini-metric">
              <span>Agent reviewed</span>
              <strong>{agentReviewed}</strong>
            </div>
            <div className="mini-metric">
              <span>Latest cycle</span>
              <strong>{latestRun?.run_date ?? "Pending"}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="stats-board">
        <article className="stat-card stat-card-primary">
          <span className="stat-label">Targets screened</span>
          <strong className="stat-value">{runs.length}</strong>
          <p>Curated real-company slate with deterministic first-pass review.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Advance</span>
          <strong className="stat-value">{decisionCount(runs, "advance")}</strong>
          <p>Targets that survived both the rule engine and strategic interpretation.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Reject</span>
          <strong className="stat-value">{decisionCount(runs, "reject")}</strong>
          <p>Immediate financial fails or strategic rejects with stored reason codes.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Agent reviewed</span>
          <strong className="stat-value">{agentReviewed}</strong>
          <p>Only threshold-passing targets reach the strategic-fit model boundary.</p>
        </article>
      </section>

      <section className="editorial-layout">
        <div className="panel screening-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Screening ledger</span>
              <h2>Latest screening runs</h2>
            </div>
            <p className="muted">
              Each card combines deterministic screen state, strategic theme alignment, and final disposition.
            </p>
          </div>
          <div className="screening-list">
            {runs.map((run) => (
              <Link href={`/targets/${run.company_id}`} className="target-card" key={run.report_id}>
                <div className="target-card-top">
                  <div className="target-card-copy">
                    <span className="target-date">{run.run_date}</span>
                    <h3>{run.company_name}</h3>
                    <p className="target-theme">
                      {formatTheme(run.report.strategic_result?.primary_theme)} <span className="muted-dot">•</span>{" "}
                      {run.report.audit_trail.agent_invoked ? "Agent reviewed" : "Deterministic reject"}
                    </p>
                  </div>
                  <span className={`pill ${run.final_decision}`}>{formatDecisionLabel(run.final_decision)}</span>
                </div>
                <p className="target-summary">
                  {run.report.strategic_result?.fit_rationale ?? "Rejected before strategic interpretation."}
                </p>
                <div className="target-card-bottom">
                  <div className="reason-list">
                    {run.final_reason_codes.length > 0 ? (
                      run.final_reason_codes.slice(0, 2).map((code) => (
                        <span className="reason" key={code}>
                          {formatReason(code)}
                        </span>
                      ))
                    ) : (
                      <span className="reason reason-muted">No caution codes</span>
                    )}
                  </div>
                  <span className="view-link">Open dossier</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="panel system-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">System posture</span>
              <h2>Decision architecture</h2>
            </div>
          </div>
          <p className="muted">
            The deterministic router owns calculations, thresholds, routing, and reason codes. The model is used only
            for strategic interpretation against Salesforce themes.
          </p>
          <table className="table architecture-table">
            <tbody>
              <tr>
                <th>Data source</th>
                <td>Real-company target set with curated financial assumptions and optional website enrichment</td>
              </tr>
              <tr>
                <th>Storage</th>
                <td>Supabase</td>
              </tr>
              <tr>
                <th>Reports</th>
                <td>Structured report JSON plus Markdown stored in the database</td>
              </tr>
              <tr>
                <th>Agent model</th>
                <td>`gpt-5.4-nano` with mock fallback when no API key is present</td>
              </tr>
            </tbody>
          </table>
          <div className="system-note">
            <span className="eyebrow">Why it matters</span>
            <p>
              This keeps M&A workflow control inspectable while still allowing qualitative judgment where product and
              distribution fit cannot be reduced to formulas.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
