# Submission

## 1. Company and Strategic Context

Salesforce is the selected company. It operates in enterprise software with a CRM-centered platform business model and competes across workflow automation, developer tooling, customer data, and vertical SaaS adjacencies. The internal stakeholder is Salesforce Corporate Development, which needs a constrained screening system to decide which acquisition targets should advance to deeper diligence.

## 2. Agent Prompt

See [deliverables/prompt.md](/C:/Users/f-rui/OneDrive/Documents/Playground/deliverables/prompt.md).

## 3. Technologies Used

- Next.js App Router: used for a lightweight internal dashboard and API routes in one stack.
- TypeScript: used for strict schemas, inspectable interfaces, and deterministic pipeline logic.
- OpenAI Agents SDK with `gpt-5.4-nano`: used for the narrow strategic-fit agent with structured output.
- Supabase: used for persistent target and screening-run storage with a simple hosted Postgres-backed service.
- Vitest: used for deterministic tests across metrics, routing, decisions, and report shape.

## 4. Inputs

- Structured company target packets with product summaries, customer summaries, and financial fields.
- Inputs are currently a hand-built sample dataset of ten targets for assignment realism and inspectability.
- Inputs are collected as static fixtures in v1 rather than live feeds.
- Preprocessing normalizes each company into a validated company record before screening.

## 5. Outputs

- Structured screening decision persisted in Supabase.
- Markdown report per target in `reports/screening/`.
- Dashboard-ready list and detail views.
- Outputs include reason codes, threshold results, and agent-derived strategic interpretation.

## 6. Knowledge Sources Used

- Salesforce strategic themes are hardcoded as system context.
- No external persistent market knowledge base is used in v1.
- Historical screening state is stored in Supabase as prior screening runs.

## 8. Tools the Agent Has Access To

- Structured input packet only.
- No web browsing.
- No financial calculator.
- No database write access.
- One job: strategic interpretation for Salesforce.

## 9. What the Agent Does Well

- Narrows the agent boundary to strategic judgment only.
- Preserves auditability because math, thresholds, routing, and reason codes stay deterministic.
- Produces structured output that can be mapped into final decisions without hidden reasoning.

## 10. Where the Agent Fails

- It depends heavily on the quality of the product summary in the input packet.
- It can underrate niche but strategically important assets if the summary is too terse.
- In this assignment build, the fallback mock agent is useful for demos but less realistic than a live API-backed run.
