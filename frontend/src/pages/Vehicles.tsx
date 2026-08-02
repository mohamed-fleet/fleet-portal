import React, { useState, useRef } from "react";
import { useVehicles } from "../hooks/useVehicles";
import { VehicleStatus } from "../types";
import { parseSpreadsheetFile, VEHICLE_CSV_TEMPLATE } from "../utils/csv";

export default function Vehicles() {
  const { vehicles, loading, error, addVehicle, addManyVehicles, updateVehicle, deleteVehicle } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plateNumber: "", model: "" });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ createdCount: number; errors: { row: number; error: string }[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plateNumber || !form.model) return;
    setSubmitting(true);
    try {
      await addVehicle({
        plateNumber: form.plateNumber,
        model: form.model,
        status: "active",
        lastMaintenanceDate: new Date().toISOString().slice(0, 10),
        nextMaintenanceDate: new Date().toISOString().slice(0, 10),
      });
      setForm({ plateNumber: "", model: "" });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseSpreadsheetFile(file);
      const items = rows.map((row) => ({
        plateNumber: row.plateNumber,
        model: row.model,
        status: (row.status as VehicleStatus) || "active",
        lastMaintenanceDate: row.lastMaintenanceDate,
        nextMaintenanceDate: row.nextMaintenanceDate,
      }));
      const result = await addManyVehicles(items);
      setUploadResult({ createdCount: result.created.length, errors: result.errors });
    } catch {
      setUploadResult({ createdCount: 0, errors: [{ row: 0, error: "تعذّر قراءة الملف — تأكد إنه ملف Excel (.xlsx) أو CSV صحيح" }] });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([VEHICLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vehicles-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">المركبات</h1>
          <p className="text-steel text-sm">إدارة مركبات الأسطول وحالتها</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="border border-black/10 text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-black/5 transition-colors"
          >
            تحميل قالب CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-black/10 text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            {uploading ? "جارِ الرفع..." : "⬆ رفع ملف Excel / CSV"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-ink text-fog px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            {showForm ? "إلغاء" : "+ إضافة مركبة"}
          </button>
        </div>
      </div>

      {uploadResult && (
        <div className="bg-white border border-black/5 rounded-lg p-4 mb-6 text-sm">
          <p className="text-route font-medium mb-1">
            تم رفع {uploadResult.createdCount} مركبة بنجاح ✅
          </p>
          {uploadResult.errors.length > 0 && (
            <div className="text-alert mt-2">
              <p className="font-medium">تعذّر رفع {uploadResult.errors.length} صف:</p>
              <ul className="list-disc mr-5 mt-1 max-h-40 overflow-y-auto">
                {uploadResult.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>صف {err.row}: {err.error}</li>
                ))}
              </ul>
              {uploadResult.errors.length > 10 && (
                <p className="text-steel text-xs mt-1">
                  و{uploadResult.errors.length - 10} صف إضافي بنفس المشكلة — تأكد إن أول صف في الملف فيه أعمدة plateNumber و model.
                </p>
              )}
            </div>
          )}
          <button onClick={() => setUploadResult(null)} className="text-steel text-xs mt-2 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-lg p-5 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-steel mb-1" htmlFor="plateNumber">رقم اللوحة</label>
            <input
              id="plateNumber"
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
              value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-steel mb-1" htmlFor="model">الموديل</label>
            <input
              id="model"
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-route text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "جارِ الحفظ..." : "حفظ"}
          </button>
        </form>
      )}

      {error && <p className="text-alert text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-fog">
            <tr className="text-right text-steel">
              <th className="px-5 py-3 font-medium">رقم اللوحة</th>
              <th className="px-5 py-3 font-medium">الموديل</th>
              <th className="px-5 py-3 font-medium">الحالة</th>
              <th className="px-5 py-3 font-medium">الصيانة القادمة</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-5 py-4 text-steel" colSpan={5}>جارِ التحميل...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td className="px-5 py-4 text-steel" colSpan={5}>لا توجد مركبات مسجلة بعد.</td></tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-mono">{v.plateNumber}</td>
                  <td className="px-5 py-3">{v.model}</td>
                  <td className="px-5 py-3">
                    <select
                      value={v.status}
                      onChange={(e) => updateVehicle(v.id, { status: e.target.value as VehicleStatus })}
                      className="border border-black/10 rounded-md text-xs px-2 py-1 bg-white"
                      aria-label={`تغيير حالة ${v.plateNumber}`}
                    >
                      <option value="active">نشطة</option>
                      <option value="maintenance">تحت الصيانة</option>
                      <option value="inactive">متوقفة</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 font-mono text-steel">{v.nextMaintenanceDate}</td>
                  <td className="px-5 py-3 text-left">
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="text-alert text-xs font-medium hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
