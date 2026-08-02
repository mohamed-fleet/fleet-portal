export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: "active" | "maintenance" | "inactive";
  costCenter: string;
  assetNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type VehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
