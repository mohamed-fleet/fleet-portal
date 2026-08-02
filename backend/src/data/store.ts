import { v4 as uuid } from "uuid";
import { Vehicle, Driver, Trip, User } from "../types";

// NOTE: This is an in-memory store so the MVP runs with zero setup.
// Swap this module for a real PostgreSQL/Prisma layer when moving past MVP —
// every route only talks to the functions exported here, so that's the
// single place you'll need to change.

const driverA: Driver = {
  id: uuid(),
  name: "Ahmed Hassan",
  phone: "+20 100 123 4567",
  licenseNumber: "DRV-1042",
  licenseExpiry: "2027-03-01",
  status: "active",
};

const driverB: Driver = {
  id: uuid(),
  name: "Mona Ali",
  phone: "+20 122 987 6543",
  licenseNumber: "DRV-2091",
  licenseExpiry: "2026-11-15",
  status: "active",
};

export const drivers: Driver[] = [driverA, driverB];

export const vehicles: Vehicle[] = [
  {
    id: uuid(),
    plateNumber: "CAI 1234",
    model: "Hiace 2022",
    brand: "Toyota",
    manufactureYear: "2022",
    color: "أبيض",
    status: "صالحة",
    licenseExpiryDate: "2026-09-01",
    assignedDriverId: driverA.id,
  },
  {
    id: uuid(),
    plateNumber: "CAI 5678",
    model: "Canter 2021",
    brand: "Mitsubishi",
    manufactureYear: "2021",
    color: "أبيض",
    status: "تحت الصيانة",
    licenseExpiryDate: "2026-08-05",
    assignedDriverId: driverB.id,
  },
  {
    id: uuid(),
    plateNumber: "CAI 9012",
    model: "Porter 2023",
    brand: "Hyundai",
    manufactureYear: "2023",
    color: "أبيض",
    status: "غير صالحة",
    licenseExpiryDate: "2026-09-20",
  },
];

export const trips: Trip[] = [
  {
    id: uuid(),
    vehicleId: vehicles[0].id,
    driverId: driverA.id,
    startTime: "2026-07-30T08:00:00Z",
    endTime: "2026-07-30T11:30:00Z",
    startLocation: "Cairo Warehouse",
    endLocation: "Alexandria Depot",
    distanceKm: 220,
    fuelCost: 850,
  },
];

export const users: User[] = [
  { id: uuid(), name: "Admin User", email: "admin@fleet.com", password: "admin123", role: "admin" },
  { id: uuid(), name: driverA.name, email: "ahmed@fleet.com", password: "driver123", role: "driver" },
];
