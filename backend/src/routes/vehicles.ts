import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { vehicles } from "../data/store";
import { Vehicle, VehicleInput } from "../types/vehicle";

const router = Router();

// GET all vehicles
router.get("/", (req: Request, res: Response) => {
  res.json(vehicles);
});

// GET single vehicle
router.get("/:id", (req: Request, res: Response) => {
  const vehicle = vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }
  res.json(vehicle);
});

// POST create vehicle
router.post("/", (req: Request, res: Response) => {
  const body = req.body as VehicleInput;

  if (!body.plateNumber || !body.model || !body.costCenter || !body.assetNumber) {
    return res.status(400).json({
      error: "رقم اللوحة والموديل ومركز التكلفة ورقم الأصل حقول مطلوبة",
    });
  }

  const newVehicle: Vehicle = {
    id: randomUUID(),
    plateNumber: body.plateNumber,
    model: body.model,
    brand: body.brand,
    year: body.year,
    status: body.status || "active",
    costCenter: body.costCenter,
    assetNumber: body.assetNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// PUT update vehicle
router.put("/:id", (req: Request, res: Response) => {
  const index = vehicles.findIndex((v) => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }

  const body = req.body as Partial<VehicleInput>;

  vehicles[index] = {
    ...vehicles[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  res.json(vehicles[index]);
});

// DELETE vehicle
router.delete("/:id", (req: Request, res: Response) => {
  const index = vehicles.findIndex((v) => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "السيارة غير موجودة" });
  }

  vehicles.splice(index, 1);
  res.status(204).send();
});

export default router;
