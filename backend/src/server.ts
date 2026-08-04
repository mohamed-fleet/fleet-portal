import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles";
import driversRouter from "./routes/drivers";
import tripsRouter from "./routes/trips";
import authRouter from "./routes/auth";
import { initDb } from "./data/db";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.get("/", (_req, res) => res.json({ status: "ok", message: "Fleet Portal API is running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/trips", tripsRouter);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Fleet portal API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
