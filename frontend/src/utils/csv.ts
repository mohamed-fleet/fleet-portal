// Minimal CSV parser — good enough for simple vehicle-import sheets
// (no embedded commas inside quoted fields needed for our use case).
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    return row;
  });
}

export const VEHICLE_CSV_TEMPLATE = `plateNumber,model,status,lastMaintenanceDate,nextMaintenanceDate
CAI 1111,Toyota Hiace 2023,active,2026-06-01,2026-09-01
CAI 2222,Isuzu NPR 2020,maintenance,2026-05-15,2026-08-15
`;
