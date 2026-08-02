import { Router } from "express";
import { v4 as uuid } from "uuid";
import { vehicles } from "../data/store";

const router = Router();

// GET /api/vehicles
router.get("/", (_req, res) => {
  res.json(vehicles);
});

// GET /api/vehicles/:id
router.get("/:id", (req, res) => {
  const vehicle = vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
});

// POST /api/vehicles
router.post("/", (req, res) => {
  const { plateNumber, model, status, assignedDriverId, lastMaintenanceDate, nextMaintenanceDate } = req.body;
  if (!plateNumber || !model) {
    return res.status(400).json({ error: "plateNumber and model are required" });
  }
  const newVehicle = {
    id: uuid(),
    plateNumber,
    model,
    status: status ?? "active",
    assignedDriverId,
    lastMaintenanceDate: lastMaintenanceDate ?? new Date().toISOString(),
    nextMaintenanceDate: nextMaintenanceDate ?? new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// PUT /api/vehicles/:id
router.put("/:id", (req, res) => {
  const index = vehicles.findIndex((v) => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles[index] = { ...vehicles[index], ...req.body };
  res.json(vehicles[index]);
});

// DELETE /api/vehicles/:id
router.delete("/:id", (req, res) => {
  const index = vehicles.findIndex((v) => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vehicle not found" });
  const [removed] = vehicles.splice(index, 1);
  res.json(removed);
});

// POST /api/vehicles/bulk — accepts an array of vehicles (used by CSV upload)
router.post("/bulk", (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Expected an array of vehicles" });
  }

  const created: typeof vehicles = [];
  const errors: { row: number; error: string }[] = [];

  items.forEach((item, index) => {
    if (!item.plateNumber || !item.model) {
      errors.push({ row: index + 1, error: "plateNumber and model are required" });
      return;
    }
    const newVehicle = {
      id: uuid(),
      plateNumber: item.plateNumber,
      model: item.model,
      status: item.status ?? "active",
      assignedDriverId: item.assignedDriverId || undefined,
      lastMaintenanceDate: item.lastMaintenanceDate || new Date().toISOString().slice(0, 10),
      nextMaintenanceDate: item.nextMaintenanceDate || new Date().toISOString().slice(0, 10),
    };
    vehicles.push(newVehicle);
    created.push(newVehicle);
  });

  res.status(201).json({ created, errors });
});

export default router;
