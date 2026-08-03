export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: "active" | "maintenance" | "inactive";
  costCenter: string;
  assetNumber: string;
  licenseExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type VehicleFormData = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry?: string;
  status: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime?: string;
  startLocation: string;
  endTime?: string;
  endLocation?: string;
  distanceKm?: number;
  fuelCost?: number;
  status?: string;
  [key: string]: any;
}
