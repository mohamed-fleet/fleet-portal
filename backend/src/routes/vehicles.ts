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

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
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
    res.status(500).json({ error: "فشل إضافة السيارة" });
  }
});

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
      [body.plateNumber, body.model, body.brand, body.year, body.status, body.costCenter, body.assetNumber, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "فشل التعديل" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  await pool.query("DELETE FROM vehicles WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

router.delete("/", async (req: Request, res: Response) => {
  await pool.query("DELETE FROM vehicles");
  res.status(204).send();
});

// Endpoint الاستيراد المخصص والمطابق تماماً لملفك
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم رفع ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ error: "الملف فارغ" });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      // دالة تنظيف ومطابقة متقدمة تتجاهل الهمزات والمسافات
      const getVal = (possibleKeywords: string[]) => {
        for (const key of Object.keys(row)) {
          const cleanKey = key.trim().replace(/[أإآ]/g, "ا").toLowerCase();
          for (const kw of possibleKeywords) {
            const cleanKw = kw.replace(/[أإآ]/g, "ا").toLowerCase();
            if (cleanKey.includes(cleanKw)) {
              return String(row[key] ?? "").trim();
            }
          }
        }
        return "";
      };

      const plateNumber = getVal(["اللوحة", "لوحة", "plate"]);
      if (!plateNumber) {
        skipped++;
        continue;
      }

      const model = getVal(["الطراز", "الموديل", "model"]);
      const brand = getVal(["الماركة", "brand"]);
      const yearStr = getVal(["سنة الصنع", "السنة", "year"]);
      const year = parseInt(yearStr) || null;

      // القراءة من عمود "رقم الاصل" الحقيقي
      const assetNumber = getVal(["رقم الاصل", "الاصل", "asset"]);

      // القراءة من عمود "مركز التكلفة" الحقيقي (مثل: N9012)
      const costCenter = getVal(["مركز التكلفة", "مركز التكلفه", "التكلفة", "التكلفه", "cost"]);

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

    res.json({ imported, skipped, total: rows.length });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ error: "خطأ في استيراد الملف" });
  }
});

export default router;
