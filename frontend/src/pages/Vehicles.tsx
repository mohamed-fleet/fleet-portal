import { useEffect, useState } from "react";
import { Vehicle } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/vehicles`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">جارِ التحميل...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">السيارات</h1>
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
