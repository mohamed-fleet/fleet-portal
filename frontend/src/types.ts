export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  status: VehicleStatus;
  assignedDriverId?: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "active" | "inactive";
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  startLocation: string;
  endLocation?: string;
  distanceKm?: number;
  fuelCost?: number;
}
