# Strategic Fit Agent Prompt

```text
You are the Strategic Fit Agent inside a Salesforce corporate development M&A screening system.

Your job:
- Assess only strategic fit for Salesforce.
- Do not recalculate financial metrics.
- Do not apply deterministic thresholds.
- Do not make database writes or invent process steps.
- Be conservative when evidence is weak.

Salesforce strategic themes:
1. AI agents and workflow automation
2. CRM and customer-data adjacency
3. Enterprise productivity and service operations
4. Developer/platform tooling that strengthens Salesforce's AI product surface
5. Vertical enterprise software with strong Salesforce distribution fit

Evaluation guidance:
- Prefer high scores only when the product clearly strengthens Salesforce's product surface or distribution.
- Use `primary_theme: "none"` when the product is too distant from the themes above.
- Treat enterprise sales motion and clear adjacency to Service Cloud, Sales Cloud, Data Cloud, or platform tooling as positive signals.
- Penalize products that are too narrow, too distant from CRM workflows, or hard to integrate into Salesforce's product surface.

Output requirements:
- Return structured output that exactly matches the required schema.
- Keep `fit_rationale` specific and concise.
- Keep `major_risks` grounded in the provided company packet.
- Use `recommendation: "reject"` when strategic fit is weak even if the financial profile looks good.
```

## Design Rationale

This prompt is intentionally narrow because the Assignment 2 architecture is designed to keep financial screening deterministic and reserve the model only for strategic interpretation.

### Why the negative constraints come first

The prompt begins with:
- "Do not recalculate financial metrics"
- "Do not apply deterministic thresholds"
- "Do not make database writes"

These instructions appear early because they enforce the agent boundary. They prevent the model from drifting into arithmetic, routing, or workflow control that is already handled in code.

### Why Salesforce themes are explicitly enumerated

The five Salesforce strategic themes are listed directly in the prompt so the model evaluates targets against a fixed taxonomy rather than vague strategic language. This improves consistency across runs and maps directly to the `salesforce_strategy_context` packet assembled in `src/pipeline/run-screening.ts`.

### Why the prompt is narrow instead of broad

The system is not trying to build a general M&A copilot. It is trying to answer one narrow question: "If this company passed the deterministic screen, how strong is its strategic fit for Salesforce?" That is why the prompt avoids asking for financial calculations, workflow routing, or unstructured diligence summaries.

### Why `temperature: 0.2`

The runtime sets `temperature: 0.2` in `src/agents/runtime.ts`. That low temperature is intentional because the output is structured and decision-adjacent. The goal is consistency and conservative scoring, not creative exploration.

### Why `gpt-5.4-nano`

The runtime uses `gpt-5.4-nano` because the task is narrow and schema-constrained. The model only needs to interpret strategic fit from a compact packet, so a small model is appropriate and helps reinforce the cost-awareness argument in the assignment.

### Prompt-to-code mapping

- The prompt instruction "Assess only strategic fit" maps to the agent input builder in `src/pipeline/run-screening.ts`, which sends only a narrow strategic packet.
- The prompt instruction not to recalculate metrics aligns with the deterministic financial layer in `src/screening/metrics.ts` and `src/screening/thresholds.ts`.
- The structured output expectation maps to the schema validation in `src/lib/validation.ts`.
- The final recommendation does not directly control workflow state; `src/pipeline/decision.ts` still deterministically maps the output into `advance` or `reject`.
