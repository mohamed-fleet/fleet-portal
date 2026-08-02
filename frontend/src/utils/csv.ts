import * as XLSX from "xlsx";

// Reads a vehicle-import file — supports both .csv and Excel (.xlsx/.xls) —
// and returns rows as plain objects keyed by (normalized) column header.
// Excel files are read natively via SheetJS so formatting, quoting, and
// Excel date values are handled correctly instead of being read as raw text.
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv");

  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: "string", cellDates: true })
    : XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  return rawRows.map((rawRow) => {
    const row: Record<string, string> = {};
    Object.entries(rawRow).forEach(([header, value]) => {
      const key = normalizeHeader(header);
      row[key] = String(value ?? "").trim();
    });
    return row;
  });
}

// Maps common header variants (English/Arabic, different casing/spacing) to our expected field names
const HEADER_ALIASES: Record<string, string> = {
  platenumber: "plateNumber",
  "plate number": "plateNumber",
  plate: "plateNumber",
  "رقم اللوحة": "plateNumber",
  model: "model",
  "الموديل": "model",
  status: "status",
  "الحالة": "status",
  lastmaintenancedate: "lastMaintenanceDate",
  "last maintenance date": "lastMaintenanceDate",
  nextmaintenancedate: "nextMaintenanceDate",
  "next maintenance date": "nextMaintenanceDate",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? header.trim();
}

export const VEHICLE_CSV_TEMPLATE = `plateNumber,model,status,lastMaintenanceDate,nextMaintenanceDate
CAI 1111,Toyota Hiace 2023,active,2026-06-01,2026-09-01
CAI 2222,Isuzu NPR 2020,maintenance,2026-05-15,2026-08-15
`;
