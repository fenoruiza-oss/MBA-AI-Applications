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
   - The normalized record includes company identity, product description, customer description, sales motion, financial values, source references, and data-quality flags.
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

- Input packet with product summary, customer summary, selected metrics, caution codes, and Salesforce themes: **900 tokens**
- Structured strategic-fit output: **350 tokens**
- Total per reviewed target: **1,250 tokens**

Estimated daily total for the actual design:

- `9 reviewed targets x 1,250 tokens = 11,250 tokens/day`

Estimated monthly total at 30 days:

- `11,250 x 30 = 337,500 tokens/month`

Comparison:

- All-agent design: **21,000 tokens/day**
- Actual design: **11,250 tokens/day**
- Reduction: **9,750 tokens/day**
- Approximate reduction: **46.4%**

The current seeded dataset is intentionally broad, so many companies still reach the agent. In a stricter or higher-volume production funnel, the savings from deterministic routing would likely be larger. Even in this class-sized version, the architecture reduces token use by limiting model calls to strategic interpretation instead of the full workflow.
