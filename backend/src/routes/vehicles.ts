import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { pool } from "../db";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. جلب جميع السيارات
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        plate_number AS "plateNumber",
        plate_number AS "plate_number",
        brand,
        model,
        year,
        status,
        cost_center AS "costCenter",
        cost_center AS "cost_center",
        asset_number AS "assetNumber",
        asset_number AS "asset_number"
      FROM vehicles 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

// 2. استيراد ملف Excel مع قراءة جميع مسميات الأعمدة العربية والإنجليزي
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم اختيار ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    let count = 0;

    for (const row of data) {
      // قراءة البيانات باللغة العربية والإنجليزي لكل الاحتمالات
      const plateNumber = String(row["رقم اللوحة"] || row["plateNumber"] || row["plate_number"] || row["رقم لوحة السيارة"] || "").trim();
      const brand = String(row["الماركة"] || row["brand"] || row["ماركة السيارة"] || "").trim();
      const model = String(row["الموديل"] || row["model"] || row["نوع السيارة"] || "").trim();
      const year = parseInt(row["السنة"] || row["year"] || row["سنه الصنع"] || 0) || 2020;
      const status = String(row["الحالة"] || row["status"] || "active").trim();
      
      // قراءة مركز التكلفة ورقم الأصل
      const costCenter = String(row["مركز التكلفة"] || row["مركز تكلفة السيارة"] || row["costCenter"] || row["cost_center"] || "").trim();
      const assetNumber = String(row["رقم الأصل"] || row["رقم اصل السيارة"] || row["assetNumber"] || row["asset_number"] || "").trim();

      if (plateNumber) {
        await pool.query(
          `INSERT INTO vehicles (plate_number, brand, model, year, status, cost_center, asset_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [plateNumber, brand, model, year, status, costCenter, assetNumber]
        );
        count++;
      }
    }

    return res.json({ imported: count });
  } catch (error) {
    console.error("Import error:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء معالجة الملف" });
  }
});

// 3. مسح جميع البيانات
router.delete("/", async (req: Request, res: Response) => {
  try {
    await pool.query("TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE");
    res.json({ message: "تم مسح جميع السيارات بنجاح" });
  } catch (error) {
    console.error("Delete all error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء المسح" });
  }
});

export default router;
