import { describe, expect, it } from "vitest";
import { extractPageSignals } from "@/ingest/live-enrichment";

describe("extractPageSignals", () => {
  it("extracts title and description from common meta tags", () => {
    const html = `
      <html>
        <head>
          <title>Workato - Enterprise Orchestration</title>
          <meta name="description" content="Automate workflows, data, and AI agents across your enterprise." />
        </head>
      </html>
    `;

    const signals = extractPageSignals(html);
    expect(signals.title).toContain("Workato");
    expect(signals.description).toContain("Automate workflows");
  });
});
