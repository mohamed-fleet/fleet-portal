import { Router } from "express";
import { v4 as uuid } from "uuid";
import { drivers } from "../data/store";

const router = Router();

router.get("/", (_req, res) => {
  res.json(drivers);
});

router.get("/:id", (req, res) => {
  const driver = drivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: "Driver not found" });
  res.json(driver);
});

router.post("/", (req, res) => {
  const { name, phone, licenseNumber, licenseExpiry, status } = req.body;
  if (!name || !phone || !licenseNumber) {
    return res.status(400).json({ error: "name, phone and licenseNumber are required" });
  }
  const newDriver = {
    id: uuid(),
    name,
    phone,
    licenseNumber,
    licenseExpiry: licenseExpiry ?? new Date().toISOString(),
    status: status ?? "active",
  };
  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

router.put("/:id", (req, res) => {
  const index = drivers.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Driver not found" });
  drivers[index] = { ...drivers[index], ...req.body };
  res.json(drivers[index]);
});

router.delete("/:id", (req, res) => {
  const index = drivers.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Driver not found" });
  const [removed] = drivers.splice(index, 1);
  res.json(removed);
});

export default router;
