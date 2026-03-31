# Submission

## 1. System Explanation

This system is an M&A screening and judgment workflow for Salesforce Corporate Development. Its purpose is to evaluate acquisition targets while keeping financial screening deterministic and using an agent only for strategic interpretation.

The end-to-end workflow is:

1. **Ingest target companies**
   - The system loads a target dataset.
   - The default mode uses a curated set of **real companies** such as Zapier, Workato, Intercom, Gong, Talkdesk, Dataiku, Hex, ServiceTitan, and Mews.
   - In live-enrichment mode, the system fetches official company websites to refresh product-language fields such as `product_summary` (`src/ingest/live-enrichment.ts`).

2. **Normalize the data**
   - Each target is converted into a structured `CompanyRecord`.
   - The normalized record includes:
     - `company_id`, `company_name`, `website`, `headquarters`
     - `ownership_type`, `industry_category`, `sales_motion`
     - `product_summary`, `customer_summary`
     - `annual_revenue_usd`, `revenue_growth_yoy_pct`, `gross_margin_pct`, `burn_multiple`, `net_retention_pct`, `cash_months_remaining`, `debt_to_revenue_ratio`
     - provenance fields such as `source_financials`, `source_product`, `financial_as_of`, and `financial_provenance`
     - `data_quality_flags`
   - This step is schema-validated and deterministic.

3. **Compute financial metrics deterministically**
   - The code calculates:
     - revenue scale band
     - growth efficiency score
     - margin health
     - retention health
     - runway health
     - leverage health
     - screening completeness score
   - The formulas are deterministic and implemented in `src/screening/metrics.ts`. For example:
     - `growth_efficiency_score = revenue_growth_yoy_pct / burn_multiple`
     - `screening_completeness_score = present required fields / total required fields`
     - revenue band is bucketed into `<10M`, `10-25M`, `25-75M`, and `75M+`
   - This implementation deliberately uses the financial values already present in the normalized packet; it does not ask the model to derive or reinterpret arithmetic.
   - No agent is used for this step.

4. **Apply deterministic screening thresholds**
   - The system checks each target against explicit rules for:
     - annual revenue
     - revenue growth
     - gross margin
     - cash runway
     - burn multiple
     - net retention
     - leverage
     - completeness
   - Current hard-fail thresholds in code (`src/screening/thresholds.ts`) are:
     - reject if revenue `< $5M`
     - reject if growth `< 15%`
     - reject if gross margin `< 50%`
     - reject if runway `< 6 months`
     - reject if burn multiple `> 3.0`
     - reject if net retention `< 100%`
     - reject if debt-to-revenue `> 1.0`
     - reject if completeness `< 0.70`
   - Current borderline thresholds in code are:
     - revenue `< $10M`
     - growth `< 25%`
     - gross margin `< 60%`
     - net retention `< 110%`
     - runway `< 12 months`
     - debt-to-revenue between `0.75` and `1.0`
     - completeness `< 0.85`
   - Deterministic reason codes are assigned here, including `REV_TOO_SMALL`, `GROWTH_TOO_LOW`, `MARGIN_TOO_LOW`, `BURN_TOO_HIGH`, `RETENTION_TOO_WEAK`, `RUNWAY_TOO_SHORT`, `LEVERAGE_TOO_HIGH`, `DATA_INCOMPLETE`, and `BORDERLINE_FINANCIAL_PROFILE`.

5. **Route companies**
   - If a company fails deterministic screening, it is immediately marked `reject` and does **not** go to the agent.
   - If a company passes deterministic screening, it is routed to the strategic-fit agent.

6. **Strategic-fit agent**
   - The agent receives only a narrow packet:
     - company name
     - product summary
     - customer summary
     - industry category
     - sales motion
     - selected deterministic metrics
     - caution codes
     - Salesforce strategic themes
   - The agent does **not** calculate metrics, apply thresholds, or write to the database.
   - The agent returns structured output containing:
     - `strategic_fit_score`
     - `primary_theme`
     - `distribution_fit`
     - `product_surface_synergy`
     - `integration_complexity`
     - `major_risks`
     - `recommendation`

7. **Make the final decision deterministically**
   - Final workflow control is still deterministic.
   - If the deterministic screen failed, final status is `reject`.
   - If the deterministic screen passed, the system checks the structured strategic-fit output.
   - A company is marked `advance` only if the structured output meets explicit thresholds such as:
     - `strategic_fit_score >= 4`
     - `distribution_fit != low`
     - `product_surface_synergy != low`
     - `confidence >= 0.60`
   - Otherwise the system maps agent output into final strategic reason codes such as `NO_STRATEGIC_FIT`, `WEAK_SALESFORCE_CHANNEL_FIT`, `OVERLAP_TOO_DISTANT`, and `PRODUCT_SURFACE_WEAK`.

8. **Generate reports and store results**
   - The system writes one Markdown report per target.
   - Each report includes:
     - company snapshot
     - deterministic financial screen
     - threshold result table
     - strategic fit assessment
     - final decision
     - reason codes
     - audit notes
   - Results are stored in Supabase in:
     - `targets`
     - `screening_runs`
   - `targets` stores the normalized target packet as `payload_json`.
   - `screening_runs` stores:
     - `report_id`
     - `company_id`
     - `run_date`
     - `final_decision`
     - `report_path`
     - `deterministic_json`
     - `strategic_json`
     - `final_reason_codes_json`
     - `report_json`
   - Rejected and advanced companies are both stored with their structured results and report paths.

This architecture keeps the system inspectable: calculations, thresholds, routing, and final workflow state are deterministic, while the agent handles only strategic interpretation.

Simple pipeline view:

```text
Targets -> Normalize -> Metrics -> Thresholds -> Router
                                               |     
                                      [fail]   |   [pass]
                                        |      v
                                      Reject  Agent -> Decision -> Report -> Store
```

## 2. Task Classification: Rule-Based vs Agent-Based

| Task | Classification | Why |
| --- | --- | --- |
| Load company targets | Rule-based | This is data retrieval, not judgment. |
| Normalize company records into a fixed schema | Rule-based | Schema validation should be consistent and inspectable. |
| Compute financial metrics | Rule-based | These are arithmetic operations and should not vary across runs. |
| Apply screening thresholds | Rule-based | Thresholds are explicit business rules. |
| Assign deterministic reason codes | Rule-based | Reason codes need consistency and auditability. |
| Route companies to reject vs agent review | Rule-based | Routing should remain under explicit control. |
| Build the strategic-fit input packet | Rule-based | Input packaging should be controlled and repeatable. |
| Assess strategic adjacency to Salesforce | Agent-based | This requires semantic judgment across product descriptions and strategic themes. |
| Evaluate product-surface synergy | Agent-based | This is qualitative interpretation, not arithmetic. |
| Evaluate Salesforce distribution fit | Agent-based | This requires contextual reasoning about GTM alignment. |
| Identify narrative risks and strategic concerns | Agent-based | This is judgment-based and hard to encode as fixed rules. |
| Map structured agent output into final strategic reason codes | Rule-based | The model should not directly control workflow state. |
| Store decisions and reports in Supabase | Rule-based | Persistence is execution logic, not agent reasoning. |

### Detailed Task-by-Task Justification

**Load company targets**
This is rule-based because the system is simply loading known target records from a dataset. An agent would add no reasoning value here and would only introduce variability into a deterministic data-loading step.

**Normalize company records into a fixed schema**
Normalization is rule-based because the input must map into a strict `CompanyRecord` structure. Using an agent for schema conversion would be risky because inconsistent field mapping would undermine every downstream metric and threshold check.

**Compute financial metrics**
This is rule-based because the metrics in `src/screening/metrics.ts` are arithmetic. An agent would be wasteful here: code computes them in milliseconds, while an LLM would consume tokens and could miscalculate.

**Apply screening thresholds**
This is rule-based because the pass, borderline, and fail logic is explicitly defined in `src/screening/thresholds.ts`. If the agent handled thresholding, identical financial inputs could yield inconsistent outcomes across runs.

**Assign deterministic reason codes**
This is rule-based because reason codes must be stable and auditable. An agent would be risky because it might produce slightly different labels or phrasings for the same underlying failure.

**Route companies to reject vs agent review**
This is rule-based because routing is workflow control, not interpretation. Letting the agent decide whether it should even be invoked would remove one of the main cost-control levers in the architecture.

**Build the strategic-fit input packet**
This is rule-based because the model should receive a controlled, minimal packet. Deterministic input construction prevents prompt sprawl and keeps the agent boundary narrow.

**Assess strategic adjacency to Salesforce**
This is agent-based because deterministic rules are insufficient to map open-ended product descriptions to Salesforce’s five strategic themes. Probabilistic reasoning adds value because the model can judge semantic similarity and strategic complementarity across free text.

**Evaluate product-surface synergy**
This is agent-based because there is not a simple formula for whether a target strengthens Salesforce’s AI product surface. The model can synthesize product summaries, buyer context, and platform fit in a way deterministic rules would struggle to generalize.

**Evaluate Salesforce distribution fit**
This is agent-based because GTM fit depends on qualitative interpretation of sales motion, customer type, and adjacency to Salesforce channels. Deterministic keywords would be brittle and likely overfit to a narrow set of examples.

**Identify narrative risks and strategic concerns**
This is agent-based because risk identification is interpretive and contextual. The model adds value by surfacing plausible issues such as weak adjacency or integration complexity in a structured but non-formulaic way.

**Map structured agent output into final strategic reason codes**
This is rule-based because the model should not directly control final workflow state. Deterministic mapping ensures that the same strategic output always produces the same final codes.

**Store decisions and reports in Supabase**
This is rule-based because storage is an execution task. An agent would add no useful reasoning and would only create unnecessary latency and cost.

## 3. Why All Tasks Were Not Assigned to the Agent

### Risks of Full Agent Control

If the model were responsible for calculations, thresholds, routing, and strategic fit, one faulty output could distort the entire workflow. A single mistake in revenue growth, burn multiple, or retention would propagate into screening, reason codes, and final recommendation.

### Cost Implications

Sending every task to the model would roughly double daily token usage relative to the current design. The deterministic layer removes the need to spend model tokens on arithmetic, threshold checks, and storage-oriented control logic.

### Latency Implications

Deterministic screening runs quickly in code, while each model call adds network and inference latency. Reserving model calls for only the strategic-fit stage keeps the batch responsive and operationally predictable.

### Error Propagation Risks

In an all-agent design, the same model output would affect calculations, routing, and final status. In the current design, the agent can only influence the strategic-fit layer, while the underlying financial screen stays fixed.

### Auditability and Compliance

M&A workflows need defensible decisions. Deterministic formulas and thresholds provide repeatable outputs for identical inputs, which makes reject and advance decisions easier to explain than a fully model-driven workflow.

## 4. Estimated Token Calculation if All Tasks Were Agent-Based

Assume the system processes **10 targets per day**, which matches the current seeded dataset size.

If every target were sent to an agent for:
- data interpretation
- financial calculations
- threshold application
- reason-code assignment
- strategic-fit analysis
- final recommendation narrative

then each target would require a larger prompt because the agent would need all company data plus instructions for the full workflow.

Estimated reasoning steps in an all-agent design:

1. Parse and validate the company packet
2. Compute all financial metrics
3. Evaluate each threshold and assign reason codes
4. Decide pass, fail, or borderline routing
5. Assess strategic fit against Salesforce themes
6. Produce structured decision output
7. Write final recommendation narrative

Estimated tokens per target in an all-agent design:

- System prompt with full workflow instructions: **~400 tokens**
- Company packet with all normalized fields: **~350 tokens**
- Financial formulas, threshold instructions, and reason-code logic: **~300 tokens**
- Strategic-fit guidance and output format instructions: **~250 tokens**
- JSON and schema overhead: **~300 tokens**
- Total input: **~1,600 tokens**

- Financial metrics and threshold results: **~150 tokens**
- Reason codes and routing result: **~50 tokens**
- Strategic-fit structured output: **~150 tokens**
- Recommendation narrative: **~150 tokens**
- Total output: **~500 tokens**
- Total per target: **2,100 tokens**

Assumptions:

- Model: `gpt-5.4-nano`
- 10 targets/day
- no retries included
- compact but structured JSON-style output
- estimates are directional and intended to compare architectures rather than forecast billing exactly

Estimated daily total:

- `10 targets x 2,100 tokens = 21,000 tokens/day`

Estimated monthly total at 30 days:

- `21,000 x 30 = 630,000 tokens/month`

This design would also be weaker because the agent would be handling tasks that are better treated as deterministic operations.

## 5. Estimated Token Calculation for Your Actual Design

In the actual architecture, deterministic code handles:
- normalization
- metric calculation
- threshold logic
- reason-code assignment
- routing
- final workflow control

Only threshold-passing targets are sent to the strategic-fit agent.

Using the current real-company seeded batch as a concrete example:

- **10 targets/day**
- **1 target** rejected deterministically before the agent
- **9 targets** sent to the strategic-fit agent

Estimated tokens per reviewed target:

- System prompt and strategic-fit instructions: **~220 tokens**
- Company identity, product summary, and customer summary: **~180 tokens**
- Deterministic summary block with selected metrics and caution codes: **~180 tokens**
- Salesforce strategic themes and routing context: **~120 tokens**
- JSON and schema overhead: **~200 tokens**
- Total input: **~900 tokens**

- Scores, theme labels, fit levels, and recommendation: **~120 tokens**
- Rationale and major risks: **~180 tokens**
- JSON overhead: **~50 tokens**
- Total output: **~350 tokens**
- Total per reviewed target: **1,250 tokens**

Why these estimates are reasonable:

- The **900 input tokens** are lower than the all-agent design because the model is not being asked to do calculations, threshold evaluation, or workflow control.
- The **350 output tokens** are plausible because the agent returns a compact structured object, not a long-form memo.

Estimated daily total for the actual design:

- `9 reviewed targets x 1,250 tokens = 11,250 tokens/day`

Estimated monthly total at 30 days:

- `11,250 x 30 = 337,500 tokens/month`

Comparison:

- All-agent design: **21,000 tokens/day**
- Actual design: **11,250 tokens/day**
- Reduction: **9,750 tokens/day**
- Approximate reduction: **46.4%**

Scaling view:

| Targets/day | Deterministic rejection rate | Agent calls/day | Total tokens/day | Estimated monthly total |
| --- | --- | --- | --- | --- |
| 10 | 10% | 9 | ~11,250 | ~337,500 |
| 50 | 20% | 40 | ~50,000 | ~1,500,000 |
| 100 | 30% | 70 | ~87,500 | ~2,625,000 |
| 500 | 40% | 300 | ~375,000 | ~11,250,000 |

The current seeded dataset is intentionally broad and strategy-friendly, so only 1 of 10 targets is rejected before the model. That makes the current demo funnel less efficient than a true production funnel. In a larger real screening workflow, the deterministic layer would likely reject a much higher share of targets, so the cost-saving advantage of the architecture would become even more meaningful.
