export function markdownTable(rows: Array<[string, string, string]>): string {
  const header = "| Field | Value | Status |\n| --- | --- | --- |";
  const body = rows.map(([field, value, status]) => `| ${field} | ${value} | ${status} |`).join("\n");
  return `${header}\n${body}`;
}

export function formatCurrency(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  return `${value}%`;
}
