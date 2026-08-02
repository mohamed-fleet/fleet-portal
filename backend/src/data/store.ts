import { Vehicle } from "../types/vehicle";
import { randomUUID } from "crypto";

export const vehicles: Vehicle[] = [
  {
    id: randomUUID(),
    plateNumber: "ABC-1234",
    model: "Hilux",
    brand: "Toyota",
    year: 2022,
    status: "active",
    costCenter: "CC-001",
    assetNumber: "AST-1001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    plateNumber: "XYZ-5678",
    model: "Land Cruiser",
    brand: "Toyota",
    year: 2021,
    status: "maintenance",
    costCenter: "CC-002",
    assetNumber: "AST-1002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
