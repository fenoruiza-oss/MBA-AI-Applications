import type { StrategicFitInput, StrategicFitOutput } from "@/lib/types";

export type StrategicFitAgent = (input: StrategicFitInput) => Promise<StrategicFitOutput>;
