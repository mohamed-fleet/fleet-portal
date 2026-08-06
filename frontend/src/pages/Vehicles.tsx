import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVehicles = () => {
    setLoading(true);
    fetch(`${API_URL}/api/vehicles`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
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
      setMessage("Imported " + data.imported + " vehicles successfully");
      loadVehicles();
    } catch (err) {
      setMessage("Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all vehicles?")) return;
    setMessage("");
    try {
      await fetch(`${API_URL}/api/vehicles`, { method: "DELETE" });
      setMessage("All vehicles deleted");
      loadVehicles();
    } catch (err) {
      setMessage("Error deleting vehicles");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Vehicles</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete All
          </button>
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            {uploading ? "Uploading..." : "Upload Excel File"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
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
              <th className="px-4 py-2 text-right text-sm font-medium">Plate Number</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Brand</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Model</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Year</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Status</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Cost Center</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Asset Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.map((v: any, index: number) => (
              <tr key={v.id || index}>
                <td className="px-4 py-2">{v.plateNumber || v.plate_number || v.plate || "-"}</td>
                <td className="px-4 py-2">{v.brand || "-"}</td>
                <td className="px-4 py-2">{v.model || "-"}</td>
                <td className="px-4 py-2">{v.year || "-"}</td>
                <td className="px-4 py-2">{v.status || "-"}</td>
                <td className="px-4 py-2">{v.costCenter || v.cost_center || "-"}</td>
                <td className="px-4 py-2">{v.assetNumber || v.asset_number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
