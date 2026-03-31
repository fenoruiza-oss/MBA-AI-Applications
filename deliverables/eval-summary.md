# Eval Summary

This project includes explicit evaluation fixtures for the deterministic router, the strategic-fit agent, the markdown report writer, the live-enrichment parser, the public-company override layer, and the end-to-end pipeline.

## Latest test run

Latest local run:

```text
Test Files: 7 passed
Tests: 10 passed
Duration: ~1 second
Command: npm.cmd run test
```

## Eval Coverage

| File or suite | What it checks | Why it matters |
| --- | --- | --- |
| `router.jsonl` | Threshold behavior and reason-code assignment | Verifies deterministic screening is stable. |
| `strategic-fit.jsonl` | Theme mapping and conservative recommendation behavior | Verifies the agent stays within its strategic-fit boundary. |
| `report-writer.jsonl` | Required markdown sections | Verifies report outputs match the intended format. |
| `pipeline-e2e.jsonl` | End-to-end outcomes for representative targets | Verifies the full screening pipeline is coherent. |
| `tests/metrics.test.ts` | Arithmetic metric calculations | Verifies formulas remain deterministic. |
| `tests/router.test.ts` | Hard-fail and borderline routing | Verifies pass/fail logic and agent routing. |
| `tests/decision.test.ts` | Final deterministic decision mapping | Verifies strategic output is mapped into final workflow control correctly. |
| `tests/report-writer.test.ts` | Markdown report structure | Verifies the reporting layer remains inspectable. |
| `tests/live-enrichment.test.ts` | Website metadata extraction | Verifies live enrichment can parse page signals deterministically. |
| `tests/public-company-overrides.test.ts` | Official-source public-company override behavior | Verifies provenance-backed overrides are applied correctly. |
| `tests/pipeline.integration.test.ts` | Batch-level integration behavior | Verifies the screening run completes end-to-end. |

## Key Findings

- The deterministic financial layer is the most stable part of the system; the metric, threshold, and routing tests all pass consistently.
- The strategic-fit layer is constrained by structured I/O, which reduces the chance of free-form agent drift.
- The reporting layer is easy to verify because required sections are explicit and testable.
- The new real-company enrichment path is viable, but its parser coverage is intentionally lightweight because this is still a class-sized project.

## Limitations

- The eval datasets are intentionally small and assignment-scoped rather than production-grade.
- The token and routing behavior are demonstrated on a curated 10-company dataset, not a large real corp-dev funnel.
- Live website enrichment is more fragile than the purely deterministic finance layer because third-party pages can change.
