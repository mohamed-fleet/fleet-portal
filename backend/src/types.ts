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

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
}
