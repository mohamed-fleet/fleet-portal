import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import { pool } from "../data/db";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const SELECT_FIELDS = `
  id,
  plate_number AS "plateNumber",
  model,
  brand,
  year,
  status,
  cost_center AS "costCenter",
  asset_number AS "assetNumber",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM vehicles");
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء المسح" });
  }
});

router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم رفع ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length <= 1) {
      return res.status(400).json({ error: "الملف فارغ" });
    }

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const plateNumber = String(row[0] ?? "").trim(); // العمود A (اللوحة)
      if (!plateNumber) {
        skipped++;
        continue;
      }

      const assetNumber = String(row[1] ?? "").trim(); // العمود B (رقم الأصل)
      const costCenter  = String(row[2] ?? "").trim(); // العمود C (مركز التكلفة)
      const brand       = String(row[4] ?? "").trim(); // العمود E (الماركة)
      const model       = String(row[5] ?? "").trim(); // العمود F (الطراز)
      const yearStr     = String(row[6] ?? "").trim(); // العمود G (سنة الصنع)
      const year        = parseInt(yearStr) || null;

      await pool.query(
        `INSERT INTO vehicles (id, plate_number, model, brand, year, status, cost_center, asset_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          plateNumber,
          model,
          brand,
          year,
          "active",
          costCenter,
          assetNumber,
        ]
      );
      imported++;
    }

    res.json({ imported, skipped, total: rows.length - 1 });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ error: "خطأ في استيراد الملف" });
  }
});

export default router;
