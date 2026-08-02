import React from "react";
import { useVehicles } from "../hooks/useVehicles";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { vehicles, loading } = useVehicles();

  const counts = {
    total: vehicles.length,
    valid: vehicles.filter((v) => v.status === "صالحة").length,
    notValid: vehicles.filter((v) => v.status && v.status !== "صالحة").length,
    unknown: vehicles.filter((v) => !v.status).length,
  };

  const upcomingLicenseExpiry = vehicles
    .filter((v) => v.licenseExpiryDate && v.licenseExpiryDate !== "-")
    .sort((a, b) => (a.licenseExpiryDate ?? "").localeCompare(b.licenseExpiryDate ?? ""))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
      <p className="text-steel text-sm mb-8">نظرة عامة على حالة الأسطول الآن</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي المركبات" value={counts.total} accent="ink" />
        <StatCard label="صالحة" value={counts.valid} accent="route" />
        <StatCard label="غير صالحة" value={counts.notValid} accent="alert" />
        <StatCard label="بدون بيانات حالة" value={counts.unknown} accent="signal" />
      </div>

      <div className="bg-white rounded-lg border border-black/5 p-6">
        <h2 className="font-semibold mb-4">أقرب تواريخ انتهاء رخصة السير</h2>
        {loading ? (
          <p className="text-steel text-sm">جارِ التحميل...</p>
        ) : upcomingLicenseExpiry.length === 0 ? (
          <p className="text-steel text-sm">لا توجد بيانات تواريخ متاحة حاليًا.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-steel border-b border-black/5">
                <th className="pb-2 font-medium">المركبة</th>
                <th className="pb-2 font-medium">الحالة</th>
                <th className="pb-2 font-medium">تاريخ انتهاء الرخصة</th>
              </tr>
            </thead>
            <tbody>
              {upcomingLicenseExpiry.map((v) => (
                <tr key={v.id} className="border-b border-black/5 last:border-0">
                  <td className="py-3">{v.plateNumber} — {v.brand ? `${v.brand} ` : ""}{v.model}</td>
                  <td className="py-3"><StatusBadge status={v.status} /></td>
                  <td className="py-3 font-mono text-steel">{v.licenseExpiryDate}</td>
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
