import type { StrategicFitOutput } from "@/lib/types";

const textReplacements: Array<[RegExp, string]> = [
  [/Ã¢â‚¬â„¢|Ã¢â‚¬Ëœ/g, "'"],
  [/Ã¢â‚¬Å“|Ã¢â‚¬/g, '"'],
  [/Ã¢â‚¬â€œ|Ã¢â‚¬â€/g, "-"],
  [/â€™|â€˜|’|‘/g, "'"],
  [/â€œ|â€�|“|”/g, '"'],
  [/â€“|â€”|â€"|–|—/g, "-"],
  [/…/g, "..."],
  [/\u00a0/g, " "],
  [/Â/g, ""],
];

export function normalizeTextForStorage(value: string): string {
  return textReplacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value).trim();
}

export function normalizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (typeof value !== "string") {
    return value;
  }

  return normalizeTextForStorage(value);
}

export function normalizeStrategicFitOutput(output: StrategicFitOutput): StrategicFitOutput {
  return {
    ...output,
    fit_rationale: normalizeTextForStorage(output.fit_rationale),
    secondary_themes: output.secondary_themes.map(normalizeTextForStorage),
    major_risks: output.major_risks.map(normalizeTextForStorage),
  };
}
