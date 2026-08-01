import React from "react";
import { useVehicles } from "../hooks/useVehicles";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { vehicles, loading } = useVehicles();

  const counts = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    inactive: vehicles.filter((v) => v.status === "inactive").length,
  };

  const upcomingMaintenance = vehicles
    .filter((v) => v.nextMaintenanceDate)
    .sort((a, b) => a.nextMaintenanceDate.localeCompare(b.nextMaintenanceDate))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
      <p className="text-steel text-sm mb-8">نظرة عامة على حالة الأسطول الآن</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي المركبات" value={counts.total} accent="ink" />
        <StatCard label="نشطة" value={counts.active} accent="route" />
        <StatCard label="تحت الصيانة" value={counts.maintenance} accent="signal" />
        <StatCard label="متوقفة" value={counts.inactive} accent="alert" />
      </div>

      <div className="bg-white rounded-lg border border-black/5 p-6">
        <h2 className="font-semibold mb-4">أقرب مواعيد الصيانة</h2>
        {loading ? (
          <p className="text-steel text-sm">جارِ التحميل...</p>
        ) : upcomingMaintenance.length === 0 ? (
          <p className="text-steel text-sm">لا توجد صيانة مجدولة حاليًا.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-steel border-b border-black/5">
                <th className="pb-2 font-medium">المركبة</th>
                <th className="pb-2 font-medium">الحالة</th>
                <th className="pb-2 font-medium">تاريخ الصيانة القادمة</th>
              </tr>
            </thead>
            <tbody>
              {upcomingMaintenance.map((v) => (
                <tr key={v.id} className="border-b border-black/5 last:border-0">
                  <td className="py-3">{v.plateNumber} — {v.model}</td>
                  <td className="py-3"><StatusBadge status={v.status} /></td>
                  <td className="py-3 font-mono text-steel">{v.nextMaintenanceDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const accentClasses: Record<string, string> = {
  ink: "text-ink",
  route: "text-route",
  signal: "text-signal",
  alert: "text-alert",
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-white rounded-lg border border-black/5 p-5">
      <p className="text-steel text-xs mb-2">{label}</p>
      <p className={`text-3xl font-display font-bold ${accentClasses[accent] ?? "text-ink"}`}>{value}</p>
    </div>
  );
}
