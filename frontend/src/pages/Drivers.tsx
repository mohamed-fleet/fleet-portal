import React, { useEffect, useState } from "react";
import api from "../api";
import { Driver } from "../types";

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", licenseNumber: "" });

  const load = async () => {
    setLoading(true);
    const res = await api.get<Driver[]>("/drivers");
    setDrivers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.licenseNumber) return;
    await api.post("/drivers", {
      ...form,
      licenseExpiry: new Date().toISOString().slice(0, 10),
      status: "active",
    });
    setForm({ name: "", phone: "", licenseNumber: "" });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">السائقون</h1>
          <p className="text-steel text-sm">إدارة بيانات السائقين وحالتهم</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-ink text-fog px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          {showForm ? "إلغاء" : "+ إضافة سائق"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-lg p-5 mb-6 grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-steel mb-1">الاسم</label>
            <input
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-steel mb-1">رقم الهاتف</label>
            <input
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-steel mb-1">رقم الرخصة</label>
            <input
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
              value={form.licenseNumber}
              onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="col-span-3 bg-route text-white px-4 py-2 rounded-md text-sm font-medium">
            حفظ السائق
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-fog">
            <tr className="text-right text-steel">
              <th className="px-5 py-3 font-medium">الاسم</th>
              <th className="px-5 py-3 font-medium">الهاتف</th>
              <th className="px-5 py-3 font-medium">رقم الرخصة</th>
              <th className="px-5 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-5 py-4 text-steel" colSpan={4}>جارِ التحميل...</td></tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="border-t border-black/5">
                  <td className="px-5 py-3">{d.name}</td>
                  <td className="px-5 py-3 font-mono">{d.phone}</td>
                  <td className="px-5 py-3 font-mono">{d.licenseNumber}</td>
                  <td className="px-5 py-3">{d.status === "active" ? "نشط" : "غير نشط"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
