# Submission

## 1. System Explanation

This system is an M&A screening and judgment workflow for Salesforce Corporate Development. Its purpose is to evaluate acquisition targets while keeping financial screening deterministic and using an agent only for strategic interpretation.

The end-to-end workflow is:

1. **Ingest target companies**
   - The system loads a target dataset.
   - The default mode uses a curated set of **real companies** such as Zapier, Workato, Intercom, Gong, Talkdesk, Dataiku, Hex, ServiceTitan, and Mews.
   - In live-enrichment mode, the system fetches official company websites to refresh product-language fields such as `product_summary`.

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
   - The formulas are deterministic and versioned in code. For example:
     - `growth_efficiency_score = revenue_growth_yoy_pct / burn_multiple`
     - `screening_completeness_score = present required fields / total required fields`
     - revenue band is bucketed into `<10M`, `10-25M`, `25-75M`, and `75M+`
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
   - Current hard-fail thresholds in code are:
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
   - `targets` stores the normalized company packet as `payload_json`.
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

## 3. Why All Tasks Were Not Assigned to the Agent

All tasks were not assigned to the agent because that would make the system more expensive, less auditable, and less reliable.

First, financial screening is fundamentally deterministic. Revenue, growth, margin, burn multiple, runway, and retention can be computed or checked directly in code. Sending those steps to an LLM would add token cost without improving the result.

Second, this is an M&A workflow, so auditability matters. Corporate development teams need to explain why a target was rejected or advanced. Deterministic formulas and explicit threshold rules make that possible. If an agent handled calculations, routing, and reason-code assignment, the workflow would be harder to defend and inspect.

Third, keeping calculations and routing deterministic reduces error propagation. In an all-agent system, one model mistake could affect arithmetic, screening, strategic interpretation, and final status at once. In this architecture, the agent can influence only the strategic-fit layer.

Fourth, latency improves when deterministic code handles most of the pipeline. Code can screen every target quickly, while the model is reserved for the smaller subset of tasks that genuinely need interpretation.

Finally, using a narrow agent boundary shows architectural judgment. The point of the assignment is not to maximize agent usage. The point is to decide where agents are useful and where explicit logic is better.

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

Estimated tokens per target in an all-agent design:

- Input company packet + full workflow instructions: **1,600 tokens**
- Output with calculations, reason codes, and recommendation: **500 tokens**
- Total per target: **2,100 tokens**

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

- Input packet with product summary, customer summary, selected metrics, caution codes, Salesforce themes, and instructions: **900 tokens**
- Structured strategic-fit output: **350 tokens**
- Total per reviewed target: **1,250 tokens**

Why those estimates are reasonable:

- The **900 input tokens** include:
  - the target company packet
  - 6-7 financial fields
  - deterministic caution codes
  - Salesforce strategy themes
  - the strategic-fit instructions
  - this is materially smaller than the all-agent design because formulas, thresholds, and routing instructions are not being sent to the model
- The **350 output tokens** include:
  - `strategic_fit_score`
  - theme labels
  - fit rationale
  - risk list
  - recommendation
  - because the output is structured JSON-like data rather than a long memo, it remains relatively compact

Estimated daily total for the actual design:

- `9 reviewed targets x 1,250 tokens = 11,250 tokens/day`

Estimated monthly total at 30 days:

- `11,250 x 30 = 337,500 tokens/month`

Comparison:

- All-agent design: **21,000 tokens/day**
- Actual design: **11,250 tokens/day**
- Reduction: **9,750 tokens/day**
- Approximate reduction: **46.4%**

The current seeded dataset is intentionally broad and strategy-friendly, so many companies still reach the agent. That makes the current example less efficient than a stricter production funnel. In a larger real pipeline, the deterministic screen would likely reject a higher share of companies before any model call. Even in this class-sized version, the architecture still reduces token use by limiting model calls to strategic interpretation instead of the full workflow.
