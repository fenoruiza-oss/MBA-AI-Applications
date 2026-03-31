import type { CompanyRecord } from "@/ingest/types";

type ExtractedPageSignals = {
  title: string | null;
  description: string | null;
};

const USER_AGENT = "Mozilla/5.0 (compatible; SalesforceMAScreener/1.0; +https://example.com)";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaContent(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(stripHtml(match[1]));
    }
  }
  return null;
}

export function extractPageSignals(html: string): ExtractedPageSignals {
  const title = extractMetaContent(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"]+)["']/i,
    /<title>([^<]+)<\/title>/i,
  ]);

  const description = extractMetaContent(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"]+)["']/i,
  ]);

  return { title, description };
}

export async function enrichCompanyFromWebsite(company: CompanyRecord): Promise<CompanyRecord> {
  if (!company.website) {
    return company;
  }

  try {
    const response = await fetch(company.website, {
      headers: {
        "user-agent": USER_AGENT,
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ...company,
        data_quality_flags: [...company.data_quality_flags, "live-fetch-failed"],
      };
    }

    const html = await response.text();
    const signals = extractPageSignals(html);
    const liveDescription = signals.description ?? company.product_summary;
    const derivedCustomerSummary =
      signals.title && signals.title !== company.company_name
        ? `${signals.title}. ${liveDescription}`
        : company.customer_summary;

    return {
      ...company,
      product_summary: liveDescription,
      customer_summary: derivedCustomerSummary,
      source_product: [...new Set([...company.source_product, company.website])],
      data_quality_flags: [...company.data_quality_flags.filter((flag) => flag !== "real-company-profile"), "live-product-copy"],
      collected_at: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return {
      ...company,
      data_quality_flags: [...company.data_quality_flags, "live-fetch-failed"],
    };
  }
}

export async function enrichCompaniesFromWebsites(companies: CompanyRecord[]): Promise<CompanyRecord[]> {
  return Promise.all(companies.map(enrichCompanyFromWebsite));
}
