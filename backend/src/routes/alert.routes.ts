import express from "express";
import {
  createAlert,
  getActiveIncidents,
  getAllIncidents,
  getPendingIncidents,
  respondToIncident,
  updateIncidentStatus,
} from "../controllers/alert.controller";

const router = express.Router();

// POST: Create a new incident alert
router.post("/", createAlert);

// GET: Fetch incidents that are currently active (in_progress, acknowledged, assigned)
router.get("/active", getActiveIncidents);

// GET: Fetch incidents pending response, optionally filtered by department
router.get("/pending", getPendingIncidents);

// GET: Fetch the most recent incidents (limit 50)
router.get("/all", getAllIncidents);

// PUT: Update the status or assigned firefighters for a given incident
router.put("/:id", updateIncidentStatus);

// POST: Respond to an incident request (accept or reject)
router.post("/:id/respond", respondToIncident);

export { router as alertRoutes };
