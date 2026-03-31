import { describe, expect, it } from "vitest";
import { applyPublicCompanyOverrides } from "@/ingest/public-company-overrides";
import { realTargets } from "@/ingest/real-targets";

describe("applyPublicCompanyOverrides", () => {
  it("overrides ServiceTitan with official-source-backed public-company metrics", () => {
    const companies = applyPublicCompanyOverrides(realTargets);
    const serviceTitan = companies.find((company) => company.company_id === "servicetitan");

    expect(serviceTitan?.annual_revenue_usd).toBe(771900000);
    expect(serviceTitan?.gross_margin_pct).toBe(70);
    expect(serviceTitan?.financial_as_of).toBe("2025-09-04");
    expect(serviceTitan?.data_quality_flags).toContain("public-company-observed-financials");
  });
});
