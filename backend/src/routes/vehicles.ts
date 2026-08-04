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

// GET all vehicles
router.get("/", async (req: Request, res: Response) => {
  const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles ORDER BY created_at DESC`);
  res.json(result.rows);
});

// GET single vehicle
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM vehicles WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }
  res.json(result.rows[0]);
});

// POST create vehicle
router.post("/", async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.plateNumber || !body.model || !body.costCenter || !body.assetNumber) {
    return res.status(400).json({
      error: "رقم اللوحة والموديل ومركز التكلفة ورقم الأصل حقول مطلوبة",
    });
  }
  const id = randomUUID();
  const result = await pool.query(
    `INSERT INTO vehicles (id, plate_number, model, brand, year, status, cost_center, asset_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${SELECT_FIELDS}`,
    [id, body.plateNumber, body.model, body.brand, body.year, body.status || "active", body.costCenter, body.assetNumber]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update vehicle
router.put("/:id", async (req: Request, res: Response) => {
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
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }
  res.json(result.rows[0]);
});

// DELETE vehicle
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query("DELETE FROM vehicles WHERE id = $1", [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }
  res.status(204).send();
});

// DELETE all vehicles (used before re-importing)
router.delete("/", async (req: Request, res: Response) => {
  await pool.query("DELETE FROM vehicles");
  res.status(204).send();
});

// POST import vehicles from Excel
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "لم يتم رفع ملف" });
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  console.log("DEBUG - First row keys:", rows.length > 0 ? Object.keys(rows[0]) : []);
  console.log("DEBUG - First row values:", rows.length > 0 ? rows[0] : {});

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const normalizedRow: any = {};
    for (const key in row) {
      normalizedRow[key.trim()] = row[key];
    }

    const plateNumber = normalizedRow["رقم اللوحة"] || normalizedRow["plateNumber"] || normalizedRow["Plate Number"];
    if (!plateNumber) {
      skipped++;
      continue;
    }
    const model = normalizedRow["الطراز"] || normalizedRow["الموديل"] || normalizedRow["model"] || "";
    const brand = normalizedRow["الماركة"] || normalizedRow["brand"] || "";
    const
