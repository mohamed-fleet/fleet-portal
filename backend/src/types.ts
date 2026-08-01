export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  status: VehicleStatus;
  assignedDriverId?: string;
  lastMaintenanceDate: string; // ISO date
  nextMaintenanceDate: string; // ISO date
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  status: "active" | "inactive";
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string; // ISO datetime
  endTime?: string; // ISO datetime
  startLocation: string;
  endLocation?: string;
  distanceKm?: number;
  fuelCost?: number;
}

export type UserRole = "admin" | "driver" | "maintenance";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext for demo only — hash in production
  role: UserRole;
}
