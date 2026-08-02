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

// Maps the official vehicle-registration export's Arabic column headers
// (and a few common English variants) to our internal field names.
const HEADER_ALIASES: Record<string, string> = {
  // Official export headers (رقم اللوحة, الماركة, ...)
  "رقم اللوحة": "plateNumber",
  "نوع التسجيل": "registrationType",
  "الفرع": "branch",
  "الماركة": "brand",
  "الطراز": "model",
  "سنة الصنع": "manufactureYear",
  "الرقم التسلسلي": "serialNumber",
  "رقم الهيكل": "chassisNumber",
  "اللون الأساسي": "color",
  "وضع المركبة": "status",
  "تاريخ الملكية": "ownershipDate",
  "تاريخ انتهاء رخصة السير": "licenseExpiryDate",
  "تاريخ انتهاء الفحص": "inspectionExpiryDate",
  "رقم هوية المستخدم الفعلي": "actualUserId",
  "اسم المستخدم الفعلي": "actualUserName",
  "حالة الفحص": "inspectionStatus",
  "حالة التأمين": "insuranceStatus",
  "حالة التحفظ": "holdStatus",
  "تاريخ إصدار الاستمارة": "formIssueDate",
  "نوع الهيكل": "chassisType",
  "مركز التكلفة": "costCenter",
  "رقم الأصل": "assetNumber",
  // Common English/simple variants (for manually-built sheets)
  platenumber: "plateNumber",
  "plate number": "plateNumber",
  plate: "plateNumber",
  model: "model",
  brand: "brand",
  status: "status",
  color: "color",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? header.trim();
}

export const VEHICLE_CSV_TEMPLATE = `رقم اللوحة,الماركة,الطراز,سنة الصنع,اللون الأساسي,وضع المركبة,تاريخ انتهاء رخصة السير
أ ب ج 1111,تويوتا,هايس,2023,أبيض,صالحة,2026-09-01
أ ب ج 2222,ايسوزو,NPR,2020,أبيض,صالحة,2026-08-15
`;
