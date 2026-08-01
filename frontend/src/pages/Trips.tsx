import React, { useEffect, useState } from "react";
import api from "../api";
import { Trip, Vehicle, Driver } from "../types";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<Trip[]>("/trips"), api.get<Vehicle[]>("/vehicles"), api.get<Driver[]>("/drivers")]).then(
      ([t, v, d]) => {
        setTrips(t.data);
        setVehicles(v.data);
        setDrivers(d.data);
        setLoading(false);
      }
    );
  }, []);

  const vehicleLabel = (id: string) => vehicles.find((v) => v.id === id)?.plateNumber ?? "—";
  const driverLabel = (id: string) => drivers.find((d) => d.id === id)?.name ?? "—";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">الرحلات</h1>
      <p className="text-steel text-sm mb-6">سجل رحلات المركبات</p>

      <div className="bg-white rounded-lg border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-fog">
            <tr className="text-right text-steel">
              <th className="px-5 py-3 font-medium">المركبة</th>
              <th className="px-5 py-3 font-medium">السائق</th>
              <th className="px-5 py-3 font-medium">من</th>
              <th className="px-5 py-3 font-medium">إلى</th>
              <th className="px-5 py-3 font-medium">المسافة (كم)</th>
              <th className="px-5 py-3 font-medium">تكلفة الوقود</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-5 py-4 text-steel" colSpan={6}>جارِ التحميل...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td className="px-5 py-4 text-steel" colSpan={6}>لا توجد رحلات مسجلة بعد.</td></tr>
            ) : (
              trips.map((t) => (
                <tr key={t.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-mono">{vehicleLabel(t.vehicleId)}</td>
                  <td className="px-5 py-3">{driverLabel(t.driverId)}</td>
                  <td className="px-5 py-3">{t.startLocation}</td>
                  <td className="px-5 py-3">{t.endLocation ?? "—"}</td>
                  <td className="px-5 py-3 font-mono">{t.distanceKm ?? "—"}</td>
                  <td className="px-5 py-3 font-mono">{t.fuelCost ? `${t.fuelCost} ج.م` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
