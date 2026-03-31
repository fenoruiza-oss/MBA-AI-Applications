import type { CompanyRecord } from "@/ingest/types";

type PublicCompanyOverride = {
  company_id: string;
  annual_revenue_usd?: number;
  revenue_growth_yoy_pct?: number;
  gross_margin_pct?: number;
  debt_to_revenue_ratio?: number;
  net_retention_pct?: number;
  financial_as_of: string;
  source_financials: string[];
  financial_provenance: Record<string, string>;
  data_quality_flags?: string[];
};

const publicCompanyOverrides: PublicCompanyOverride[] = [
  {
    company_id: "servicetitan",
    annual_revenue_usd: 771900000,
    revenue_growth_yoy_pct: 26,
    gross_margin_pct: 70,
    debt_to_revenue_ratio: 0.14,
    net_retention_pct: 111,
    financial_as_of: "2025-09-04",
    source_financials: [
      "ServiceTitan investor relations - fiscal second quarter 2026 results",
      "ServiceTitan investor relations - fiscal fourth quarter and full year fiscal 2025 results",
    ],
    financial_provenance: {
      annual_revenue_usd:
        "Observed from ServiceTitan fiscal 2025 full-year revenue of $771.9M announced March 13, 2025.",
      revenue_growth_yoy_pct:
        "Observed from ServiceTitan fiscal 2025 full-year revenue growth of 26% announced March 13, 2025.",
      gross_margin_pct:
        "Modeled from July 31, 2025 six-month gross profit of $319.745M over revenue of $457.815M in the September 4, 2025 official release.",
      debt_to_revenue_ratio:
        "Modeled from July 31, 2025 short-term plus long-term debt of about $104.8M divided by fiscal 2025 revenue of $771.9M using official ServiceTitan investor releases.",
      net_retention_pct:
        "Observed as greater than 110% from the September 4, 2025 official ServiceTitan investor release; stored conservatively as 111%.",
    },
    data_quality_flags: ["public-company-observed-financials"],
  },
];

const overrideMap = new Map(publicCompanyOverrides.map((override) => [override.company_id, override]));

export function applyPublicCompanyOverrides(companies: CompanyRecord[]): CompanyRecord[] {
  return companies.map((company) => {
    const override = overrideMap.get(company.company_id);
    if (!override) {
      return company;
    }

    return {
      ...company,
      annual_revenue_usd: override.annual_revenue_usd ?? company.annual_revenue_usd,
      revenue_growth_yoy_pct: override.revenue_growth_yoy_pct ?? company.revenue_growth_yoy_pct,
      gross_margin_pct: override.gross_margin_pct ?? company.gross_margin_pct,
      debt_to_revenue_ratio: override.debt_to_revenue_ratio ?? company.debt_to_revenue_ratio,
      net_retention_pct: override.net_retention_pct ?? company.net_retention_pct,
      financial_as_of: override.financial_as_of,
      source_financials: [...new Set(override.source_financials)],
      financial_provenance: {
        ...(company.financial_provenance ?? {}),
        ...override.financial_provenance,
      },
      data_quality_flags: [...new Set([...company.data_quality_flags, ...(override.data_quality_flags ?? [])])],
    };
  });
}
