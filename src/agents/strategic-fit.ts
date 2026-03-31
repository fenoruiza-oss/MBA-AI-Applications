import type { StrategicFitInput } from "@/lib/types";
import { createStrategicFitAgent } from "@/agents/runtime";

const executeAgent = createStrategicFitAgent();

export async function assessStrategicFit(input: StrategicFitInput) {
  return executeAgent(input);
}
