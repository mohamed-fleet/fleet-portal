import { useEffect, useState } from "react";
import { Vehicle } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVehicles = () => {
    setLoading(true);
    fetch(`${API_URL}/api/vehicles`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/vehicles/import`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(`تم استيراد ${data.imported} سيارة بنجاح (تم تجاهل ${data.skipped})`);
      loadVehicles();
    } catch (err) {
      setMessage("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return <div className="p-4">جارِ التحميل...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">السيارات</h1>
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          {uploading ? "جارِ الرفع..." : "رفع ملف Excel"}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded border border-green-200">
          {message}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-right text-sm font-medium">رقم اللوحة</th>
              <th className="px-4 py-2 text-right text-sm font-medium">الماركة</th>
              <th className="px-4 py-2 text-right text-sm font-medium">الموديل</th>
              <th className="px-4 py-2 text-right text-sm font-medium">السنة</th>
              <th className="px-4 py-2 text-right text-sm font-medium">الحالة</th>
              <th className="px-4 py-2 text-right text-sm font-medium">مركز التكلفة</th>
              <th className="px-4 py-2 text-right text-sm font-medium">رقم الأصل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2">{v.plateNumber}</td>
                <td className="px-4 py-2">{v.brand}</td>
                <td className="px-4 py-2">{v.model}</td>
                <td className="px-4 py-2">{v.year}</td>
                <td className="px-4 py-2">{v.status}</td>
                <td className="px-4 py-2">{v.costCenter}</td>
                <td className="px-4 py-2">{v.assetNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
