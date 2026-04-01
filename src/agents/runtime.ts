import { promises as fs } from "node:fs";
import path from "node:path";
import { Agent, run } from "@openai/agents";
import { normalizeStrategicFitOutput, normalizeTextForStorage } from "@/lib/text";
import { strategicFitOutputSchema } from "@/lib/validation";
import type { StrategicFitInput, StrategicFitOutput } from "@/lib/types";
import type { StrategicFitAgent } from "@/agents/types";

const promptPath = path.join(process.cwd(), "src", "prompts", "strategic-fit.md");

async function loadPrompt(): Promise<string> {
  return fs.readFile(promptPath, "utf8");
}

function buildInputMessage(input: StrategicFitInput): string {
  return JSON.stringify(input, null, 2);
}

function summarizeModelFailure(message: string): string {
  if (/quota|insufficient_quota|429/i.test(message)) {
    return "OpenAI quota was unavailable at run time.";
  }

  if (/rate limit/i.test(message)) {
    return "OpenAI rate limits were hit at run time.";
  }

  return "OpenAI live call was temporarily unavailable.";
}

function buildFallbackStrategicFit(input: StrategicFitInput, fallbackReason?: string): StrategicFitOutput {
  const fallbackRisks = input.deterministic_summary.borderline
    ? ["Borderline financial profile requires careful diligence."]
    : ["Commercial integration assumptions should be validated."];

  if (fallbackReason) {
    fallbackRisks.push(normalizeTextForStorage(`OpenAI live call unavailable; deterministic fallback used. ${summarizeModelFailure(fallbackReason)}`));
  }

  return {
    strategic_fit_score: input.industry_category === "other" ? 2 : 4,
    confidence: 0.62,
    primary_theme: input.industry_category === "other" ? "none" : input.industry_category,
    secondary_themes:
      input.industry_category === "crm_adjacency" ? ["ai_workflow"] : ["crm_adjacency"],
    fit_rationale:
      input.industry_category === "other"
        ? "The company appears financially viable, but the product adjacency to Salesforce's core strategic themes is limited."
        : "The company aligns with Salesforce's strategic themes and could strengthen product surface area or distribution leverage.",
    distribution_fit: input.sales_motion === "enterprise" || input.sales_motion === "mixed" ? "high" : "medium",
    product_surface_synergy: input.industry_category === "other" ? "low" : "high",
    integration_complexity: input.industry_category === "developer_tooling" ? "medium" : "low",
    major_risks: fallbackRisks,
    recommendation: input.industry_category === "other" ? "reject" : "advance",
  };
}

export function createStrategicFitAgent(): StrategicFitAgent {
  return async (input: StrategicFitInput): Promise<StrategicFitOutput> => {
    const instructions = await loadPrompt();

    if (!process.env.OPENAI_API_KEY) {
      return buildFallbackStrategicFit(input);
    }

    try {
      const agent = new Agent({
        name: "Salesforce Strategic Fit Agent",
        instructions,
        model: "gpt-5.4-nano",
        outputType: strategicFitOutputSchema,
        modelSettings: {
          temperature: 0.2,
        },
      });

      const result = await run(agent, buildInputMessage(input));
      return normalizeStrategicFitOutput(strategicFitOutputSchema.parse(result.finalOutput));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown model error.";
      console.warn("Strategic fit agent fell back to deterministic mode:", message);
      return buildFallbackStrategicFit(input, message);
    }
  };
}
