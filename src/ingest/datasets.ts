import type { CompanyRecord } from "@/ingest/types";
import { enrichCompaniesFromWebsites } from "@/ingest/live-enrichment";
import { applyPublicCompanyOverrides } from "@/ingest/public-company-overrides";
import { realTargets } from "@/ingest/real-targets";
import { sampleTargets } from "@/ingest/sample-targets";

export type SeedDatasetMode = "real" | "sample";
export type EnrichmentMode = "live" | "static";

export function getSeedDatasetMode(): SeedDatasetMode {
  const value = process.env.TARGET_DATASET?.toLowerCase();
  return value === "sample" ? "sample" : "real";
}

export function getEnrichmentMode(): EnrichmentMode {
  const value = process.env.TARGET_ENRICHMENT?.toLowerCase();
  return value === "static" ? "static" : "live";
}

export async function getSeedTargets(): Promise<CompanyRecord[]> {
  const dataset = getSeedDatasetMode() === "sample" ? sampleTargets : realTargets;
  if (getSeedDatasetMode() === "sample" || getEnrichmentMode() === "static") {
    return applyPublicCompanyOverrides(dataset);
  }
  const enriched = await enrichCompaniesFromWebsites(dataset);
  return applyPublicCompanyOverrides(enriched);
}
