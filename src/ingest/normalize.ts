import { companyRecordSchema, type CompanyRecord } from "@/ingest/types";

export function normalizeCompanyRecord(input: CompanyRecord): CompanyRecord {
  return companyRecordSchema.parse(input);
}

export function normalizeCompanies(inputs: CompanyRecord[]): CompanyRecord[] {
  return inputs.map(normalizeCompanyRecord);
}
