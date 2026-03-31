# Assignment 2 Improvement Plan

## Context

After comparing `deliverables/submission.md` line-by-line against the rubric (Assignment 2 - M&A Screening and Judgment), there are several gaps that could cost points. The codebase itself is solid — the issues are in the written deliverable. This plan addresses each gap in priority order.

---

## Gap Analysis

| Section | Current State | Rubric Gap | Priority |
|---------|--------------|------------|----------|
| 2. Task Classification | Table with 1-sentence "Why" per task | **Major** — rubric requires per-task dual justification | Highest |
| 4. All-Agent Tokens | Estimates present but coarse | **Major** — missing "estimated reasoning steps"; token breakdown too high-level | High |
| 5. Actual Design Tokens | Estimates present | **Major** — no scaling analysis; rubric says "demonstrate cost scaling awareness" | High |
| 3. Why Not All-Agent | Good prose | **Medium** — rubric lists 5 explicit categories; should restructure to match | Medium |
| 1. System Explanation | Strong, covers all areas | **Low** — could add pipeline diagram and source-file references | Low |
| eval-summary.md | 11 lines, no results | **Medium** — thin supporting deliverable | Medium |
| prompt.md | Raw prompt only | **Low** — no design rationale | Low |

---

## Step 1: Expand Section 2 — Task Classification

**File:** `deliverables/submission.md` (after current line ~111)

**Problem:** The "Why" column has single-sentence justifications like "This is data retrieval, not judgment." The rubric explicitly requires:
- For agent tasks: why deterministic logic is insufficient AND why probabilistic reasoning adds value
- For rule-based tasks: why an agent would be unnecessary, risky, or wasteful

**Action:** Keep the existing summary table for quick scanning. Add a new subsection below it titled **"Detailed Task-by-Task Justification"** with 2-3 sentences per task.

For each **rule-based task** (8 tasks), address:
- Why an agent is unnecessary (bounded input-output relationship)
- Why an agent is risky (non-determinism harms auditability)
- Why an agent is wasteful (token cost for zero improvement)

Example for "Compute financial metrics":
> **Why deterministic logic is sufficient:** The seven metrics in `metrics.ts` (revenue band, growth efficiency, margin/retention/runway/leverage health, completeness) are pure arithmetic. The formula `growth_efficiency = revenue_growth_yoy_pct / burn_multiple` has no ambiguity. **Why an agent adds no value:** An LLM performing arithmetic is slower, more expensive, and empirically less reliable than code. A miscalculated margin would propagate into threshold evaluation. **Why it would be wasteful:** Each computation takes <1ms in code; an agent call adds ~500ms and ~200 tokens per company for zero quality improvement.

For each **agent task** (4 tasks), address:
- Why deterministic logic is insufficient (requires open-ended interpretation)
- Why probabilistic reasoning adds value (semantic judgment, confidence scoring)

Example for "Assess strategic adjacency to Salesforce":
> **Why deterministic logic is insufficient:** Strategic adjacency requires interpreting free-text product descriptions against Salesforce's five strategic themes. A rule-based approach would need every possible product-to-theme mapping, which is brittle. Gong's "revenue AI platform for sales, forecasting, deal inspection" has CRM adjacency clear to a human but hard to capture in keywords. **Why probabilistic reasoning adds value:** The agent synthesizes product summary, customer summary, category, and sales motion into a holistic judgment with confidence scores and risk identification — exactly where LLMs outperform rules.

**Source material from codebase:**
- `src/screening/metrics.ts:45-67` — exact `computeMetrics` formulas
- `src/screening/thresholds.ts:29-36` — threshold values ($5M revenue, 15% growth, 50% margin, etc.)
- `src/agents/runtime.ts:44-56` — agent config (model, temperature, structured output)
- `src/pipeline/run-screening.ts:14-41` — `buildStrategicInput()` showing exactly what the agent receives

---

## Step 2: Rewrite Section 4 — All-Agent Token Calculation

**File:** `deliverables/submission.md` (rewrite lines ~126-154)

**Problem:** Missing "estimated reasoning steps" (rubric-explicit requirement). Token breakdown is too coarse (just "1,600 input / 500 output").

**Action:**

### 2a. Add "Estimated Reasoning Steps" subsection
List the ~7 steps the agent would perform in an all-agent design:
1. Parse and validate company data
2. Compute 7 financial metrics (revenue band, growth efficiency, margin health, retention health, runway health, leverage health, completeness)
3. Evaluate 8 threshold checks and assign reason codes
4. Make routing decision (pass/fail/borderline)
5. Assess strategic fit across 5 Salesforce themes
6. Generate structured output (scores, rationale, risks)
7. Write final narrative recommendation

### 2b. Granular input token breakdown
Decompose the 1,600 input estimate:
- System prompt with full workflow instructions: ~400 tokens
- Company data packet (all CompanyRecord fields): ~350 tokens
- Financial calculation instructions (formulas, thresholds, reason codes): ~300 tokens
- Strategic fit assessment instructions: ~200 tokens
- Report generation template instructions: ~250 tokens
- Output schema specification: ~100 tokens
- **Total: ~1,600 tokens** (validates current estimate but now shows work)

### 2c. Granular output token breakdown
- Financial metrics and threshold results: ~150 tokens
- Reason codes and routing decision: ~50 tokens
- Strategic fit structured output (10 fields): ~150 tokens
- Narrative recommendation: ~150 tokens
- **Total: ~500 tokens**

### 2d. Add explicit "Assumptions" subsection
- Model: gpt-5.4-nano (as configured in `runtime.ts:48`)
- Temperature: 0.2 (as configured)
- 10 targets/day (matching seeded dataset)
- Token estimation via ~4 chars/token for English, ~3 chars/token for JSON
- No retry or error-handling tokens in base estimate

---

## Step 3: Rewrite Section 5 — Actual Design Token Calculation

**File:** `deliverables/submission.md` (rewrite lines ~156-196)

**Problem:** No scaling analysis. Rubric says "demonstrate awareness of cost scaling."

**Action:**

### 3a. Granular token breakdown using actual StrategicFitInput
Based on the `StrategicFitInput` type (`src/lib/types.ts:63-88`):
- System prompt (`src/prompts/strategic-fit.md`): ~220 tokens
- Company identity + summaries: ~80 tokens
- Deterministic summary block (passed_screen, borderline, 6 metrics, caution codes): ~120 tokens
- Salesforce strategy context (5 themes + org + instruction): ~100 tokens
- JSON structure overhead (`JSON.stringify(input, null, 2)` pretty-printing): ~80 tokens
- **Refined total input: ~600-700 tokens**

Note: the current estimate of 900 may be slightly high. Either revise it down or justify the padding (safety margin for longer product summaries).

Output breakdown using `StrategicFitOutput` schema (10 fields):
- Scores + theme + fit levels: ~50 tokens
- fit_rationale: ~70 tokens
- major_risks array: ~50 tokens
- JSON overhead: ~30 tokens
- **Total output: ~200-300 tokens**

### 3b. Add scaling analysis table

| Targets/day | Det. rejection rate | Agent calls/day | Total tokens/day | Est. monthly |
|-------------|-------------------|-----------------|-----------------|-------------|
| 10 | 10% | 9 | ~11,250 | ~337,500 |
| 50 | 20% | 40 | ~50,000 | ~1,500,000 |
| 100 | 30% | 70 | ~87,500 | ~2,625,000 |
| 500 | 40% | 300 | ~375,000 | ~11,250,000 |

### 3c. Add sensitivity note
- Current dataset: 1/10 rejected deterministically (10%) — low because seed data is curated
- Production M&A funnels typically see 30-50% rejection at the financial screen
- Savings compound with volume: at 500 targets/day with 40% rejection, only 300 agent calls vs. 500 in all-agent design
- The deterministic filter is the key cost lever

### 3d. Keep existing comparison
Retain the current all-agent vs. actual comparison (46.4% reduction) but add the scaling perspective.

---

## Step 4: Restructure Section 3 — Why Not All-Agent

**File:** `deliverables/submission.md` (restructure lines ~112-124)

**Problem:** Content is good but presented as flowing prose. The rubric lists 5 explicit categories.

**Action:** Reorganize existing prose into labeled subsections:

1. **Risks of Full Agent Control** — unreliable arithmetic, non-reproducible outputs across runs
2. **Cost Implications** — reference Section 4 (21,000 vs 11,250 tokens/day); extrapolate to dollar costs
3. **Latency Implications** — deterministic screening of 10 targets takes <100ms total; agent calls add ~1-3s each
4. **Error Propagation Risks** — if agent miscalculates burn_multiple, it cascades through routing, reason codes, and strategic assessment
5. **Auditability and Compliance** — M&A decisions must be defensible to board committees; deterministic code produces identical outputs for identical inputs; agent outputs may vary

This is mostly restructuring, not rewriting — the existing content maps well to these categories.

---

## Step 5: Polish Section 1 — System Explanation

**File:** `deliverables/submission.md` (near line ~92)

**Action:**
- Add a simple ASCII pipeline diagram after the numbered steps:
  ```
  Targets → Normalize → Metrics → Thresholds → Router
                                                  │
                                         [fail]   │   [pass]
                                           │      ▼
                                        Reject   Agent → Decision → Report → Store
  ```
- Add brief parenthetical source-file references throughout (e.g., "computed in `src/screening/metrics.ts`") to show the grader it's a real working system

---

## Step 6: Expand eval-summary.md

**File:** `deliverables/eval-summary.md`

**Action:**
1. Run `npm install && npm test` and capture pass/fail results
2. Add test results summary
3. Add eval dataset coverage table:
   - `router.jsonl`: threshold behavior and reason-code assignment
   - `strategic-fit.jsonl`: theme mapping and conservative recommendation
   - `report-writer.jsonl`: required markdown sections
   - `pipeline-e2e.jsonl`: overall outcome for representative targets
4. Add key findings from eval runs
5. Add limitations section (small datasets, assignment-scoped)

---

## Step 7: Expand prompt.md

**File:** `deliverables/prompt.md`

**Action:** Add design rationale explaining:
- Why negative constraints ("Do not recalculate metrics") come first — prevents agent scope creep
- Why Salesforce themes are enumerated explicitly — grounds judgment in known taxonomy
- Why `temperature: 0.2` (`runtime.ts:49`) — consistency in scored output
- Why `gpt-5.4-nano` (`runtime.ts:48`) — narrow task doesn't need a large model
- Prompt-to-code mapping (which instruction maps to which system behavior in `decision.ts`, `runtime.ts`)

---

## Verification Checklist

- [ ] Section 2 has per-task dual justification (not just one-liners)
- [ ] Section 4 includes "estimated reasoning steps" with step-by-step breakdown
- [ ] Section 4 includes granular token decomposition with explicit assumptions
- [ ] Section 5 includes scaling table (10, 50, 100, 500 targets/day)
- [ ] Section 3 is organized under the rubric's 5 explicit categories
- [ ] Section 1 has a pipeline diagram
- [ ] All token calculations are internally consistent
- [ ] Tests pass (`npm test`)
- [ ] eval-summary.md shows actual test results
- [ ] prompt.md includes design rationale
