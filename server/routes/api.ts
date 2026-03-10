import { Router } from "express";
import { addPatient, getPatientPredictions } from "../controllers/patientController";
import { addDoctor } from "../controllers/doctorController";
import { addPrediction } from "../controllers/predictionController";
import { addReport } from "../controllers/reportController";
import { pingDb } from "../db";

export const apiRouter = Router();

apiRouter.get("/health/db", async (_req, res) => {
  try {
    await pingDb();
    res.json({ status: "ok" });
  } catch (err) {
    console.error("DB health check failed", err);
    res.status(500).json({ status: "error" });
  }
});

apiRouter.post("/patients", addPatient);
apiRouter.post("/doctors", addDoctor);
apiRouter.post("/predictions", addPrediction);
apiRouter.post("/reports", addReport);
apiRouter.get("/patients/:patientId/predictions", getPatientPredictions);
