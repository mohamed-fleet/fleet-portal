import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { pool } from "../db";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// تأكيد وجود الأعمدة في قاعدة البيانات تلقائياً
const ensureColumnsExist = async () => {
  try {
    await pool.query(`
      ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cost_center VARCHAR(255);
      ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS asset_number VARCHAR(255);
    `);
  } catch (err) {
    console.error("Column check error:", err);
  }
};

// 1. جلب جميع السيارات
router.get("/", async (req: Request, res: Response) => {
  try {
    await ensureColumnsExist();
    const result = await pool.query(`
      SELECT 
        id,
        plate_number AS "plateNumber",
        brand,
        model,
        year,
        status,
        cost_center AS "costCenter",
        asset_number AS "assetNumber"
      FROM vehicles 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

// 2. استيراد ملف Excel وشمل كافة طرق القراءة (أسماء الأعمدة أو ترتيبها)
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    await ensureColumnsExist();

    if (!req.file) {
      return res.status(400).json({ error: "لم يتم اختيار ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // طريقة 1: قراءة الملف كـ Objects (حسب اسم العناوين)
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
    // طريقة 2: قراءة الملف كـ Array of Arrays (حسب الترتيب)
    const arrayData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let count = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const rowObj = jsonData[i] || {};
      const rowArr = arrayData[i + 1] || []; // i+1 للتغاضي عن صف العناوين

      // قراءة رقم اللوحة
      const plateNumber = String(
        rowObj["رقم اللوحة"] || rowObj["plateNumber"] || rowObj["plate_number"] || rowArr[0] || ""
      ).trim();

      // قراءة باقي البيانات
      const brand = String(rowObj["الماركة"] || rowObj["brand"] || rowArr[1] || "").trim();
      const model = String(rowObj["الموديل"] || rowObj["model"] || rowArr[2] || "").trim();
      const year = parseInt(rowObj["السنة"] || rowObj["year"] || rowArr[3] || 0) || 2020;
      const status = String(rowObj["الحالة"] || rowObj["status"] || rowArr[4] || "active").trim();

      // مركز التكلفة (سواء باسم العمود أو الترتيب السادس index 5)
      const costCenter = String(
        rowObj["مركز التكلفة"] ||
        rowObj["costCenter"] ||
        rowObj["cost_center"] ||
        rowArr[5] ||
        ""
      ).trim();

      // رقم الأصل (سواء باسم العمود أو الترتيب السابع index 6)
      const assetNumber = String(
        rowObj["رقم الأصل"] ||
        rowObj["assetNumber"] ||
        rowObj["asset_number"] ||
        rowArr[6] ||
        ""
      ).trim();

      if (plateNumber && plateNumber !== "undefined" && plateNumber !== "رقم اللوحة") {
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
    console.error("Delete error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء المسح" });
  }
});

export default router;
