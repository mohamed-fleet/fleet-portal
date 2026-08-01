import { Router } from "express";
import { v4 as uuid } from "uuid";
import { trips } from "../data/store";

const router = Router();

router.get("/", (_req, res) => {
  res.json(trips);
});

router.post("/", (req, res) => {
  const { vehicleId, driverId, startTime, startLocation } = req.body;
  if (!vehicleId || !driverId || !startTime || !startLocation) {
    return res.status(400).json({ error: "vehicleId, driverId, startTime and startLocation are required" });
  }
  const newTrip = {
    id: uuid(),
    vehicleId,
    driverId,
    startTime,
    startLocation,
    ...req.body,
  };
  trips.push(newTrip);
  res.status(201).json(newTrip);
});

router.put("/:id", (req, res) => {
  const index = trips.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Trip not found" });
  trips[index] = { ...trips[index], ...req.body };
  res.json(trips[index]);
});

router.delete("/:id", (req, res) => {
  const index = trips.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Trip not found" });
  const [removed] = trips.splice(index, 1);
  res.json(removed);
});

export default router;
