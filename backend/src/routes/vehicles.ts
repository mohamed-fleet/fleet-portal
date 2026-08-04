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

// 1. جلب جميع السيارات
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

// 2. جلب سيارة بواسطة الـ ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ في النظام" });
  }
});

// 3. إضافة سيارة جديدة يدوياً
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.plateNumber || !body.model) {
      return res.status(400).json({
        error: "رقم اللوحة والموديل حقول مطلوبة",
      });
    }
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO vehicles (id, plate_number, model, brand, year, status, cost_center, asset_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${SELECT_FIELDS}`,
      [
        id,
        body.plateNumber,
        body.model,
        body.brand || "",
        body.year || null,
        body.status || "active",
        body.costCenter || "",
        body.assetNumber || "",
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting vehicle:", error);
    res.status(500).json({ error: "فشل إضافة السيارة" });
  }
});

// 4. تعديل بيانات سيارة
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = await pool.query(
      `UPDATE vehicles SET
        plate_number = COALESCE($1, plate_number),
        model = COALESCE($2, model),
        brand = COALESCE($3, brand),
        year = COALESCE($4, year),
        status = COALESCE($5, status),
        cost_center = COALESCE($6, cost_center),
        asset_number = COALESCE($7, asset_number),
        updated_at = now()
       WHERE id = $8 RETURNING ${SELECT_FIELDS}`,
      [
        body.plateNumber,
        body.model,
        body.brand,
        body.year,
        body.status,
        body.costCenter,
        body.assetNumber,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "فشل تعديل البيانات" });
  }
});

// 5. حذف سيارة واحدة
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM vehicles WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "فشل عملية الحذف" });
  }
});

// 6. مسح كل البيانات (زر مسح الكل)
router.delete("/", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM vehicles");
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "فشل مسح البيانات" });
  }
});

// 7. استيراد البيانات من Excel (المعدل والمصلح)
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم رفع ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // قراءة البيانات كمصفوفة صفوف (Array of Arrays) لتفادي مشاكل الرموز والعناوين
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rawRows.length < 2) {
      return res.status(400).json({ error: "الملف فارغ أو لا يحتوي على بيانات" });
    }

    // عناوين الجدول من الصف الأول
    const headers = rawRows[0].map((h: any) => String(h || "").trim());
    console.log("=== EXCEL HEADERS FOUND ===", headers);

    // دالة مرنة للبحث عن ترتيب العمود بناءً على الكلمات المفتاحية
    const findColumnIndex = (keywords: string[]) => {
      return headers.findIndex((h) =>
        keywords.some((kw) => h.toLowerCase().includes(kw.toLowerCase()))
      );
    };

    const plateIdx = findColumnIndex(["اللوحة", "plate"]);
    const modelIdx = findColumnIndex(["الموديل", "الطراز", "model"]);
    const brandIdx = findColumnIndex(["الماركة", "brand"]);
    const yearIdx = findColumnIndex(["السنة", "الصنع", "year"]);
    const costCenterIdx = findColumnIndex(["تكلفة", "مركز", "cost"]);
    const assetNumberIdx = findColumnIndex(["أصل", "اصل", "الأصل", "الاصل", "asset"]);

    let imported = 0;
    let skipped = 0;

    // البدء من الصف الثاني لتخطي العناوين
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;

      const plateNumber = plateIdx !== -1 ? row[plateIdx] : row[0];
      if (!plateNumber) {
        skipped++;
        continue;
      }

      const model = modelIdx !== -1 ? row[modelIdx] : "";
      const brand = brandIdx !== -1 ? row[brandIdx] : "";
      const yearVal = yearIdx !== -1 ? parseInt(row[yearIdx]) : null;
      const year = isNaN(yearVal as number) ? null : yearVal;

      const costCenter = costCenterIdx !== -1 ? row[costCenterIdx] : "";
      const assetNumber = assetNumberIdx !== -1 ? row[assetNumberIdx] : "";

      await pool.query(
        `INSERT INTO vehicles (id, plate_number, model, brand, year, status, cost_center, asset_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          String(plateNumber).trim(),
          String(model).trim(),
          String(brand).trim(),
          year,
          "active",
          String(costCenter).trim(),
          String(assetNumber).trim(),
        ]
      );
      imported++;
    }

    res.json({ imported, skipped, total: rawRows.length - 1 });
  } catch (error) {
    console.error("Error importing Excel:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة ملف الـ Excel" });
  }
});

export default router;
