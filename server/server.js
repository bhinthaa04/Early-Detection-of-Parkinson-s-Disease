import "dotenv/config";
import cors from "cors";
import express from "express";
import { networkInterfaces } from "node:os";
import patientsRouter from "./routes/patients.js";
import doctorsRouter from "./routes/doctors.js";
import predictionsRouter from "./routes/predictions.js";
import reportsRouter from "./routes/reports.js";
import { checkDatabaseConnection } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/app-url", (_req, res) => {
  const interfaces = networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return res.status(200).json({ origin: `http://${entry.address}:${port}` });
      }
    }
  }

  return res.status(200).json({ origin: `http://127.0.0.1:${port}` });
});

app.get("/health", async (_req, res) => {
  try {
    await checkDatabaseConnection();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/patients", patientsRouter);
app.use("/doctors", doctorsRouter);
app.use("/predictions", predictionsRouter);
app.use("/reports", reportsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/reports", reportsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

checkDatabaseConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
