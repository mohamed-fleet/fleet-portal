import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles";
import driversRouter from "./routes/drivers";
import tripsRouter from "./routes/trips";
import authRouter from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/trips", tripsRouter);

app.listen(PORT, () => {
  console.log(`Fleet portal API running on http://localhost:${PORT}`);
});
