import express from "express";
import {
  assignFirefighters,
  completeIncident,
  confirmAndDispatch,
  createAlert,
  getActiveIncidents,
  getAllIncidents,
  getPendingIncidents,
  respondToIncident,
  updateIncidentStatus,
} from "../controllers/alert.controller";
import { validateObjectId } from "./firefighter.route";
import { body } from "express-validator";

const router = express.Router();

// POST: Create a new incident alert
router.post("/", createAlert);

// GET: Fetch incidents that are currently active (in_progress, acknowledged, assigned)
router.get("/active", getActiveIncidents);

// GET: Fetch incidents pending response, optionally filtered by department
router.get("/pending/:department_id", getPendingIncidents);

// GET: Fetch the most recent incidents (limit 50)
router.get("/all", getAllIncidents);

// PUT: Update the status or assigned firefighters for a given incident
router.put("/:id", updateIncidentStatus);

// Assign firefighters
router.patch(
  "/:id/assign",
  [
    validateObjectId,
    body("firefighterIds")
      .isArray({ min: 1 })
      .withMessage("At least one firefighter ID is required")
      .custom((value) => {
        if (!value.every((id: any) => typeof id === "string" && id.length === 24)) {
          throw new Error("All firefighter IDs must be valid")
        }
        return true
      }),
  ],
  assignFirefighters,
)

//confirm and dispatch
router.patch("/:id/confirm", validateObjectId, confirmAndDispatch)

// POST: Respond to an incident request (accept or reject)
router.post("/:id/respond", respondToIncident);

// Complete incident
router.patch(
  "/:id/complete",
  [
    validateObjectId,
    body("notes").optional().isString().withMessage("Notes must be a string"),
    body("responseTime").optional().isNumeric().withMessage("Response time must be a number"),
  ],
  completeIncident,
)

router.get("/getAssignedIncidents/:departmentId",getActiveIncidents)

export { router as alertRoutes };
