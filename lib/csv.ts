import type { Lead } from "@/types";

const CSV_HEADERS = [
  "ID",
  "Rep Name",
  "Show / Event",
  "Captured At",
  "First Name",
  "Last Name",
  "Full Name",
  "Title",
  "Company",
  "Email",
  "Phone",
  "LinkedIn",
  "TikTok",
  "Instagram",
  "Website",
  "Location",
  "Alignment Score",
  "Alignment Rationale",
  "Notes",
] as const;

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  // Wrap in quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

function splitName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return ["", ""];
  if (parts.length === 1) return [parts[0] ?? "", ""];
  const last = parts.pop() ?? "";
  return [parts.join(" "), last];
}

export function leadsToCSV(leads: Lead[]): string {
  const rows: string[] = [CSV_HEADERS.map(escapeCsvCell).join(",")];

  for (const lead of leads) {
    const [firstName, lastName] = splitName(lead.name);
    const row = [
      lead.id,
      lead.repName,
      lead.showName,
      lead.capturedAt,
      firstName,
      lastName,
      lead.name,
      lead.title,
      lead.company,
      lead.email,
      lead.phone,
      lead.linkedin,
      lead.tiktok,
      lead.instagram,
      lead.website,
      lead.location,
      lead.alignmentScore,
      lead.alignmentRationale,
      lead.notes,
    ].map(escapeCsvCell);

    rows.push(row.join(","));
  }

  return rows.join("\n");
}

export function downloadCSV(leads: Lead[], filename?: string): void {
  const csv = leadsToCSV(leads);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename ?? `leadsnap_${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
