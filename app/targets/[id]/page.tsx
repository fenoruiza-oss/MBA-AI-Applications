import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSeededRuns } from "@/pipeline/run-screening";
import { getScreeningRun } from "@/db/queries";

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

function formatReason(code: string) {
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `${value}%`;
}

function renderReportMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h3 className="memo-title" key={`title-${i}`}>
          {line.slice(2)}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h4 className="memo-section" key={`section-${i}`}>
          {line.slice(3)}
        </h4>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }

      const rows = tableLines
        .map((tableLine) => tableLine.split("|").slice(1, -1).map((cell) => cell.trim()))
        .filter((row) => row.some(Boolean));

      if (rows.length >= 2) {
        const [header, , ...body] = rows;
        nodes.push(
          <div className="memo-table-wrap" key={`table-${i}`}>
            <table className="memo-table">
              <thead>
                <tr>
                  {header.map((cell) => (
                    <th key={cell}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    if (line.startsWith("- ")) {
      const bulletLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        bulletLines.push(lines[i].trim().slice(2));
        i += 1;
      }

      nodes.push(
        <ul className="memo-list" key={`list-${i}`}>
          {bulletLines.map((bullet, bulletIndex) => (
            <li key={`bullet-${bulletIndex}`}>{bullet}</li>
          ))}
        </ul>,
      );
      continue;
    }

    nodes.push(
      <p className="memo-paragraph" key={`paragraph-${i}`}>
        {line}
      </p>,
    );
    i += 1;
  }

  return nodes;
}

export default async function TargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureSeededRuns();
  const run = await getScreeningRun(id);

  if (!run) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="detail-hero panel">
        <div>
          <span className="eyebrow">Target dossier</span>
          <h1>{run.company_name}</h1>
          <p className="hero-summary">
            Review the deterministic financial screen, strategic interpretation, and stored memo for the latest
            screening cycle.
          </p>
        </div>
        <div className="detail-hero-meta">
          <span className={`pill ${run.final_decision}`}>{run.final_decision === "advance" ? "Advance" : "Reject"}</span>
          <Link href="/" className="back-link">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-column">
          <div className="panel detail-summary-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Decision summary</span>
                <h2>{formatTheme(run.strategic?.primary_theme)}</h2>
              </div>
              <span className="detail-date">{run.run_date}</span>
            </div>

            <div className="metric-grid metric-grid-detail">
              <div className="metric">
                <span>Revenue</span>
                <strong>{formatCurrency(run.company.annual_revenue_usd)}</strong>
              </div>
              <div className="metric">
                <span>Growth</span>
                <strong>{formatPercent(run.company.revenue_growth_yoy_pct)}</strong>
              </div>
              <div className="metric">
                <span>Gross margin</span>
                <strong>{formatPercent(run.company.gross_margin_pct)}</strong>
              </div>
              <div className="metric">
                <span>Net retention</span>
                <strong>{formatPercent(run.company.net_retention_pct)}</strong>
              </div>
              <div className="metric">
                <span>Runway</span>
                <strong>{run.company.cash_months_remaining ?? "n/a"} months</strong>
              </div>
              <div className="metric">
                <span>Headquarters</span>
                <strong>{run.company.headquarters ?? "n/a"}</strong>
              </div>
            </div>
          </div>

          {run.strategic && (
            <div className="panel strategic-callout">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Strategic fit</span>
                  <h2>{run.strategic.strategic_fit_score}/5 fit score</h2>
                </div>
                <span className="confidence-chip">Confidence {run.strategic.confidence}</span>
              </div>
              <p className="strategic-rationale">{run.strategic.fit_rationale}</p>
              <div className="reason-list">
                <span className="reason">{formatTheme(run.strategic.primary_theme)}</span>
                <span className="reason">{run.strategic.distribution_fit} distribution fit</span>
                <span className="reason">{run.strategic.product_surface_synergy} product synergy</span>
                <span className="reason">{run.strategic.integration_complexity} integration complexity</span>
              </div>
            </div>
          )}

          <div className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Reason codes</span>
                <h2>Disposition markers</h2>
              </div>
            </div>
            <div className="reason-list">
              {run.final_reason_codes.length > 0 ? (
                run.final_reason_codes.map((code) => (
                  <span key={code} className="reason">
                    {formatReason(code)}
                  </span>
                ))
              ) : (
                <span className="reason reason-muted">No caution codes attached</span>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Threshold ledger</span>
                <h2>Deterministic results</h2>
              </div>
            </div>
            <table className="table threshold-table">
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
                    <td>
                      <span className={`inline-status inline-status-${status}`}>{String(status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel memo-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Stored memo</span>
              <h2>Screening report</h2>
            </div>
          </div>
          <div className="memo-document">{renderReportMarkdown(run.report_markdown)}</div>
        </div>
      </section>
    </main>
  );
}
