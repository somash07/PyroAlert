import type { NextFunction, Request, Response } from "express";
import Incident, { type IIncident } from "../models/incident.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { broadcastMessage, broadcastToDepartment } from "../socket/broadcaster";
import { AppError } from "../utils/AppError";
import { Firefighter } from "../models/fire-fighters.model";
import { sendCode } from "../utils/sendCode";
import { maileType } from "../types/mailType";
import { AuthRequest } from "../middlewares/auth.middleware";
import { io } from "../app";

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    [lat1, lon1, lat2, lon2].some(
      (coord) =>
        coord === undefined ||
        isNaN(coord) ||
        Math.abs(lat1) > 90 ||
        Math.abs(lat2) > 90 ||
        Math.abs(lon1) > 180 ||
        Math.abs(lon2) > 180
    )
  ) {
    throw new Error("Invalid coordinates");
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Function to find nearest fire department
async function findNearestFireDepartments(coordinates: [number, number]) {
  try {
    const [lng, lat] = coordinates;
    const fireDepartments = await User.find({
      isVerified: true,
      type: "Firedepartment",
    });

    if (fireDepartments.length === 0) {
      return [];
    }

    const validDepartments = fireDepartments.filter(
      (dept) =>
        dept.location?.lat !== undefined && dept.location?.lng !== undefined
    );

    const departmentsWithDistance = validDepartments.map((dept) => {
      const distance = calculateDistance(
        lat,
        lng,
        dept.location!.lat,
        dept.location!.lng
      );
      return { department: dept, distance };
    });

    // Sort by distance (nearest first)
    departmentsWithDistance.sort((a, b) => a.distance - b.distance);

    return departmentsWithDistance;
  } catch (error) {
    console.error("Error finding nearest fire departments:", error);
    return [];
  }
}
export const createAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      location,
      alert_type,
      timestamp,
      confidence,
      temperature,
      source_device_id,
      additional_info,
      geo_location,
    } = req.body;

    if (!location || !alert_type || !confidence) {
      res.status(400).json({
        message: "Missing required fields: location, alert_type, confidence",
      });
    }

    let assigned_department: mongoose.Types.ObjectId | undefined = undefined;
    let nearestDepartments: any[] = [];
    let requestedDepartment = null;

    // Find nearest fire department if coordinates are provided
    if (geo_location && geo_location.coordinates) {
      nearestDepartments = await findNearestFireDepartments(
        geo_location.coordinates
      );
      if (nearestDepartments.length > 0) {
        requestedDepartment = nearestDepartments[0].department._id;
        console.log(
          `🚨 Alert sent as request to ${
            nearestDepartments[0].department.username
          } (${nearestDepartments[0].distance.toFixed(2)} km away)`
        );
      }
    }

    let locationString = location;
    if (Array.isArray(location)) {
      locationString = location.join(", ");
    }

    const newIncidentData: Partial<IIncident> = {
      location: locationString,
      alert_type,
      timestamp: timestamp ? new Date(timestamp * 1000) : new Date(),
      confidence,
      temperature,
      source_device_id,
      additional_info,
      geo_location,
      requested_department: requestedDepartment,
      status: "pending_response", // New status for pending fire department response
      nearby_departments: nearestDepartments.slice(0, 5).map((d) => ({
        department: d.department._id,
        distance: d.distance,
      })),
    };

    const incident = new Incident(newIncidentData);
    await incident.save();

    // Populate the assigned department for the response
    await incident.populate("requested_department", "username address contact");

    // Broadcast to connected clients with department info
    const broadcastData = {
      ...incident.toObject(),
      nearestDepartment: nearestDepartments[0]
        ? {
            name: nearestDepartments[0].department.name,
            distance: nearestDepartments[0].distance.toFixed(2),
          }
        : null,
      action_required: true, // Flag to indicate this needs department action
    };

    // Broadcast to all clients, but with department-specific targeting
    broadcastMessage("NEW_INCIDENT_REQUEST", broadcastData);

    // Also broadcast specifically to the requested department
    if (requestedDepartment) {
      broadcastToDepartment(
        requestedDepartment.toString(),
        "DEPARTMENT_INCIDENT_REQUEST",
        broadcastData
      );
    }

    const responseData = {
      message: "Alert created and sent as request to nearest fire department",
      data: incident,
      requested_department: nearestDepartments[0]
        ? nearestDepartments[0].department.name
        : null,
      distance_km: nearestDepartments[0]
        ? nearestDepartments[0].distance.toFixed(2)
        : null,
      status: "pending_response",
    };

    res.status(201).json(responseData);
  } catch (error: any) {
    console.error("Error creating alert:", error);
    res
      .status(500)
      .json({ message: "Server error creating alert", error: error.message });
  }
};

export const respondToIncident = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, department_id, notes } = req.body; // action: 'accept' or 'reject'

    if (!action || !["accept", "reject"].includes(action)) {
      res
        .status(400)
        .json({ message: "Invalid action. Must be 'accept' or 'reject'" });
    }

    const incident = (await Incident.findById(id)
      .select("-assigned_firefighters")
      .populate(
        "requested_department nearby_departments.department rejection_history.department",
        "username"
      )
      .exec()) as any;

    if (!incident) res.status(404).json({ message: "Incident not found" });

    if (incident.status !== "pending_response")
      res.status(400).json({ message: "Incident is not pending response" });

    if (action === "accept") {
      // Fire department accepts the

      incident.status = "acknowledged";
      console.log(department_id as string);
      incident.assigned_department = new mongoose.Types.ObjectId(
        department_id as string
      );
      incident.response_time = new Date();
      incident.notes = notes || "Incident accepted by fire department";

      await incident.save();
      await incident.populate("assigned_department", "username ");

      broadcastMessage("INCIDENT_ACCEPTED", {
        ...incident.toObject(),
        message: `Incident accepted by ${incident.assigned_department?.username}`,
      });

      res.status(200).json({
        message: "Incident accepted successfully",
        data: incident,
      });
    } else {
      // Fire department rejects the incident

      // Try to assign to next nearest department
      const nearbyDepts = incident.nearby_departments || [];
      const currentDeptIndex = nearbyDepts.findIndex(
        (d: any) =>
          d.department._id.toString() ===
          (department_id || incident.requested_department?.toString())
      );

      if (currentDeptIndex < nearbyDepts.length - 1) {
        // Assign to next nearest department
        const nextDept = nearbyDepts[currentDeptIndex + 1];
        incident.requested_department = nextDept.department;
        incident.status = "pending_response";
        incident.rejection_history = incident.rejection_history || [];
        incident.rejection_history.push({
          department: department_id,
          reason: notes || "No reason provided",
          timestamp: new Date(),
        });

        await incident.save();
        await incident.populate(
          "requested_department",
          "username address contact"
        );

        broadcastMessage("INCIDENT_REASSIGNED", {
          ...incident.toObject(),
          message: `Incident reassigned to ${incident.requested_department?.name}`,
          action_required: true,
        });

        res.status(200).json({
          message:
            "Incident rejected and reassigned to next nearest department",
          data: incident,
          new_department: incident.requested_department?.name,
        });
      } else {
        // No more departments available
        incident.status = "unassigned";
        incident.rejection_history = incident.rejection_history || [];
        incident.rejection_history.push({
          department: department_id || incident.requested_department,
          reason: notes || "No reason provided",
          timestamp: new Date(),
        });

        await incident.save();

        broadcastMessage("INCIDENT_UNASSIGNED", {
          ...incident.toObject(),
          message:
            "Incident rejected by all nearby departments - requires manual intervention",
        });

        res.status(200).json({
          message: "Incident rejected - no more nearby departments available",
          data: incident,
          requires_manual_intervention: true,
        });
      }
    }
  } catch (error: any) {
    console.error("Error responding to incident:", error);
    res.status(500).json({
      message: "Server error responding to incident",
      error: error.message,
    });
  }
};

export const getPendingIncidents = async (req: Request, res: Response) => {
  try {
    const { department_id } = req.params;

    const query: any = { status: "pending_response" };
    if (
      department_id &&
      typeof department_id === "string" &&
      mongoose.Types.ObjectId.isValid(department_id)
    ) {
      query.requested_department = new mongoose.Types.ObjectId(department_id);
    }

    const incidents = await Incident.find(query)
      .populate(
        "requested_department rejection_history.department",
        "username address contact"
      )
      .populate("nearby_departments.department", "username")
      .sort({ timestamp: -1 });

    res.status(200).json(incidents);
  } catch (error: any) {
    console.error("Error fetching pending incidents:", error);
    res.status(500).json({
      message: "Server error fetching pending incidents",
      error: error.message,
    });
  }
};

export const getActiveIncidents = async (req: Request, res: Response) => {
  try {
    const activeStatuses = [
      "acknowledged",
      "assigned",
      "dispatched",
      "completed",
    ];
    const incidents = await Incident.find({ status: { $in: activeStatuses } })
      .populate("assigned_department", "username address contact")
      .sort({ timestamp: -1 });
    res.status(200).json(incidents);
  } catch (error: any) {
    console.error("Error fetching active incidents:", error);
    res.status(500).json({
      message: "Server error fetching active incidents",
      error: error.message,
    });
  }
};

export const getAllIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find()
      .populate("assigned_department ", "username address contact")
      .populate("rejection_history.department", "username")
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 incidents
    res.status(200).json(incidents);
  } catch (error: any) {
    console.error("Error fetching all incidents:", error);
    res.status(500).json({
      message: "Server error fetching incidents",
      error: error.message,
    });
  }
};

export const updateIncidentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assigned_firefighters, notes } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      id,
      { status, assigned_firefighters, notes },
      { new: true }
    ).populate(
      "assigned_department requested_department",
      "username address contact"
    );

    if (!incident) {
      res.status(404).json({ message: "Incident not found" });
    }

    // broadcastMessage("INCIDENT_UPDATED", incident?.toObject());
    res
      .status(200)
      .json({ message: "Incident updated successfully", data: incident });
  } catch (error: any) {
    console.error("Error updating incident:", error);
    res.status(500).json({
      message: "Server error updating incident",
      error: error.message,
    });
  }
};

export const assignFirefighters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firefighterIds, leaderId } = req.body;

    if (
      !firefighterIds ||
      !Array.isArray(firefighterIds) ||
      firefighterIds.length === 0
    ) {
      return next(new AppError("Please provide valid firefighter IDs", 400));
    }

    // Check if firefighters are available
    const firefighters = await Firefighter.find({
      _id: { $in: firefighterIds },
      status: "available",
    });

    if (firefighters.length !== firefighterIds.length) {
      return next(new AppError("Some firefighters are not available", 400));
    }
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: "assigned",
        assigned_firefighters: {
          ids: firefighterIds,
          leaderId: leaderId,
        },
        assignedAt: new Date(),
      },
      { new: true }
    )
      .populate({
        path: "assigned_firefighters.ids",
        model: "Firefighter", // replace with your actual model name
      })
      .populate({
        path: "assigned_firefighters.leaderId",
        model: "Firefighter",
      });

    if (!incident) {
      return next(new AppError("Incident not found", 404));
    }

    // Update firefighter status to busy
    await Firefighter.updateMany(
      { _id: { $in: firefighterIds } },
      { status: "busy" }
    );

    io?.emit("incident-updated", incident);
    io?.emit("firefighters-assigned", {
      incidentId: incident._id,
      firefighters,
    });

    res.json({
      success: true,
      data: incident,
      message: `${firefighters.length} firefighter(s) assigned successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmAndDispatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "assigned_firefighters",
      "username email contact"
    );

    if (!incident) {
      return next(new AppError("Incident not found", 404));
    }

    if (
      !incident.assigned_firefighters ||
      incident.assigned_firefighters.ids.length === 0
    ) {
      return next(
        new AppError("No firefighters assigned to this incident", 400)
      );
    }

    await Promise.all(
      incident.assigned_firefighters.ids.map((firefighter: any) =>
        sendCode(firefighter.email, undefined, maileType.INCIDENT_ALERT, {
          location: incident.geo_location?.coordinates,
          temperature: incident.temperature,
          coordinates: `${incident.geo_location?.coordinates[1]}, ${incident.geo_location?.coordinates[0]}`,
          incidentId: incident._id?.toString(),
          firefighterName: firefighter.name,
        })
      )
    );

    // Update incident status
    await Incident.findByIdAndUpdate(req.params.id, {
      status: "dispatched",
      dispatchedAt: new Date(),
    });

    io?.emit("firefighters-dispatched", incident);
    io?.emit("incident-updated", incident);

    res.json({
      success: true,
      message: `Emergency alerts sent to ${incident.assigned_firefighters.ids.length} firefighter(s)`,
    });
  } catch (error) {
    next(error);
  }
};

export const completeIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notes, responseTime } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completedAt: new Date(),
        completion_notes: notes,
        actualResponseTime: responseTime,
        // completedBy: req.user?.id,
      },
      { new: true }
    ).populate("assigned_Firefighters");

    if (!incident) {
      return next(new AppError("Incident not found", 404));
    }

    // Update assigned firefighters status back to available
    if (
      incident.assigned_firefighters &&
      incident.assigned_firefighters.ids.length > 0
    ) {
      await Firefighter.updateMany(
        { _id: { $in: incident.assigned_firefighters.ids.map((f) => f._id) } },
        { status: "available" }
      );
    }

    // io?.emit("incident-completed", incident);

    res.json({
      success: true,
      data: incident,
      message: "Incident marked as completed",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllIncidentsAssignedToFirefighter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firefighterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(firefighterId)) {
      return next(new AppError("Invalid firefighter ID", 400));
    }

    let statuses = req.query.status;
    if (typeof statuses === "string") {
      statuses = [statuses];
    }

    const allowedStatuses = statuses?.length
      ? statuses
      : ["assigned", "dispatched"];

    const incidents = await Incident.find({
      "assigned_firefighters.ids": firefighterId,
      status: { $in: allowedStatuses },
    });

    const incidentToSend = incidents.map((i) => ({
      _id: i._id,
      alert_type: i.alert_type,
      location: i.location,
      timestamp: i.timestamp,
      confidence: i.confidence,
      status: i.status,
      leaderId: i.assigned_firefighters?.leaderId,
      assigned_department: i.assigned_department,
      response_time: "5 minutes",
      notes: "Black smoke reported near school...",
    }));

    res.status(200).json({
      success: true,
      data: incidentToSend,
      count: incidentToSend.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleIncidentAssignedToFirefighter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { incidentId } = req.params;
    const firefighterId = req.body.firefighterId || "";

    if (
      !mongoose.Types.ObjectId.isValid(incidentId) ||
      !mongoose.Types.ObjectId.isValid(firefighterId)
    ) {
      return next(new AppError("Invalid ID provided", 400));
    }

    const incident = await Incident.findOne({
      _id: incidentId,
      "assigned_firefighters.ids": firefighterId,
    }).populate({
      path: "assigned_firefighters.ids",
      select: "name contact email image",
    });

    if (!incident) {
      return next(
        new AppError("Incident not found or not assigned to firefighter", 404)
      );
    }

    console.log("Incident found:", incident?.assigned_firefighters);

    const otherFirefighters = incident?.assigned_firefighters?.ids.filter(
      (ff) => ff._id.toString() !== firefighterId
    );

    console.log("Other firefighters:", otherFirefighters);
    const incidentToSend = {
      _id: incident._id,
      alert_type: incident.alert_type,
      location: incident.location,
      timestamp: incident.timestamp,
      status: incident.status,
      leaderId: incident.assigned_firefighters?.leaderId,
      assigned_firefighters: otherFirefighters,
      geo_location: {
        long: incident.geo_location?.coordinates[0],
        lat: incident.geo_location?.coordinates[1],
      },
      detection_method: incident.additional_info?.detection_method || "Unknown",
      device_name: incident.additional_info?.device_name || "Unknown",
      notes: incident.notes || "No notes provided",
    };

    res.status(200).json({
      success: true,
      data: incidentToSend,
    });
  } catch (error) {
    console.error("Error fetching incident:", error);
    next(error);
  }
};

export const markIncidentAsCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { notes, responseTime, leaderId } = req.body;

    const leader = await Firefighter.findById(leaderId);
    if (!leader) {
      return next(new AppError("Un Authoritized", 401));
    }

    const incident = await Incident.findByIdAndUpdate(
      id,
      {
        status: "completed",
        completedAt: new Date(),
        completion_notes: notes,
        // actualResponseTime: responseTime,
        // completedBy: req.user?.id,
      },
      { new: true }
    ).populate("assigned_firefighters.ids");

    if (!incident) {
      return next(new AppError("Incident not found", 404));
    }

    // Update assigned firefighters status back to available
    if (
      incident.assigned_firefighters &&
      incident.assigned_firefighters.ids.length > 0
    ) {
      await Firefighter.updateMany(
        { _id: { $in: incident.assigned_firefighters.ids.map((f) => f._id) } },
        { status: "available" }
      );
    }

    io?.emit("INCIDENT_COMPLETED", incident);

    res.json({
      success: true,
      data: incident,
      message: "Incident marked as completed",
    });
  } catch (error) {
    next(error);
  }
};
