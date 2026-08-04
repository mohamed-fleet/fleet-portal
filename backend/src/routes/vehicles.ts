// Endpoint الاستيراد المعتمد على الترتيب الحقيقي للأعمدة (A إلى O)
router.post("/import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم رفع ملف" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // قراءة البيانات كمصفوفة صفوف ومواضع أعمدة
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length <= 1) {
      return res.status(400).json({ error: "الملف فارغ" });
    }

    let imported = 0;
    let skipped = 0;

    // نبدأ من الصف الثاني لتجاهل عناوين الأعمدة الصفراء
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const plateNumber = String(row[0] ?? "").trim(); // A: رقم اللوحة
      if (!plateNumber) {
        skipped++;
        continue;
      }

      const assetNumber = String(row[1] ?? "").trim(); // B: رقم الاصل
      const costCenter  = String(row[2] ?? "").trim(); // C: مركز التكلفة
      const brand       = String(row[4] ?? "").trim(); // E: الماركة
      const model       = String(row[5] ?? "").trim(); // F: الطراز
      const yearStr     = String(row[6] ?? "").trim(); // G: سنة الصنع
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
