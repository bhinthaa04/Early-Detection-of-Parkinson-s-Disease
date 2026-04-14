import { Router } from "express";
import {
  addPatient,
  getAllPatients,
  getPatientById,
  getPatientPredictions,
} from "../controllers/patientController";
import { addDoctor, getAllDoctors } from "../controllers/doctorController";
import { addPrediction } from "../controllers/predictionController";
import { addReport, getReportByTestId } from "../controllers/reportController";
import { addPatientTest, getPatientTests, getAllPatientTests } from "../controllers/patientTestsController";
import { bookAppointment, getAppointmentById, getAllAppointments } from "../controllers/appointmentsController";
import { addDoctorNote, getDoctorNotes } from "../controllers/doctorNotesController";
import { addMedication, getMedications } from "../controllers/medicationsController";
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
apiRouter.get("/patients", getAllPatients);
apiRouter.get("/patients/:patientId/predictions", getPatientPredictions);
apiRouter.get("/patients/:id", getPatientById);

apiRouter.post("/doctors", addDoctor);
apiRouter.get("/doctors", (req, res) => getAllDoctors(req, res));

apiRouter.post("/predictions", addPrediction);

apiRouter.post("/reports", addReport);
apiRouter.get("/reports/:testId", getReportByTestId);

apiRouter.post("/patient-tests", addPatientTest);
apiRouter.get("/patient-tests", (req, res) => {
  if (req.query.patient_id || req.query.patientId) {
    return getPatientTests(req, res);
  }
  return getAllPatientTests(req, res);
});

apiRouter.post("/appointments/book", bookAppointment);
apiRouter.post("/appointments", bookAppointment);
apiRouter.get("/appointments", (req, res) => getAllAppointments(req, res));
apiRouter.get("/appointments/:bookingId", getAppointmentById);

apiRouter.post("/doctor-notes", addDoctorNote);
apiRouter.get("/doctor-notes", getDoctorNotes);

apiRouter.post("/medications", addMedication);
apiRouter.get("/medications", getMedications);
