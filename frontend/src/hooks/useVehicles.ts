import { useEffect, useState, useCallback } from "react";
import api from "../api";
import { Vehicle } from "../types";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Vehicle[]>("/vehicles");
      setVehicles(res.data);
      setError(null);
    } catch (err) {
      setError("تعذر تحميل بيانات المركبات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVehicle = async (vehicle: Omit<Vehicle, "id">) => {
    const res = await api.post<Vehicle>("/vehicles", vehicle);
    setVehicles((prev) => [...prev, res.data]);
  };

  const addManyVehicles = async (items: Omit<Vehicle, "id">[]) => {
    const res = await api.post<{ created: Vehicle[]; errors: { row: number; error: string }[] }>(
      "/vehicles/bulk",
      items
    );
    setVehicles((prev) => [...prev, ...res.data.created]);
    return res.data;
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    const res = await api.put<Vehicle>(`/vehicles/${id}`, updates);
    setVehicles((prev) => prev.map((v) => (v.id === id ? res.data : v)));
  };

  const deleteVehicle = async (id: string) => {
    await api.delete(`/vehicles/${id}`);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return { vehicles, loading, error, refresh, addVehicle, addManyVehicles, updateVehicle, deleteVehicle };
}
