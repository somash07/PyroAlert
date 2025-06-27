import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.model";
import Incident from "../models/incident.model";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const statsData = await getDashboardStatsData();

    res.json({
      success: true,
      data: statsData,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStatsData = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all statistics in parallel
  const [
    activeIncidents,
    availableFirefighters,
    incidentsToday,
    completedIncidents,
    totalFirefighters,
    busyFirefighters,
  ] = await Promise.all([
    Incident.countDocuments({
      status: { $in: ["pending", "accepted", "assigned", "dispatched"] },
    }),
    Firefighter.countDocuments({ status: "available" }),
    Incident.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    }),
    Incident.find({
      status: "completed",
      completedAt: { $exists: true },
      createdAt: { $exists: true },
    }).select("createdAt completedAt"),
    Firefighter.countDocuments(),
    Firefighter.countDocuments({ status: "busy" }),
  ]);

  // Calculate average response time
  let averageResponseTime = 0;
  if (completedIncidents.length > 0) {
    const totalResponseTime = completedIncidents.reduce((total, incident) => {
      const responseTime =
        (new Date(incident.response_time as Date).getTime() -
          new Date(incident.createdAt as Date).getTime()) /
        (1000 * 60); // in minutes
      return total + responseTime;
    }, 0);

    averageResponseTime = Math.round(
      totalResponseTime / completedIncidents.length
    );
  }

  // Get recent incidents for activity feed
  const recentIncidents = await Incident.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select(
      "status location.address createdAt temperature detectionMethod detectionType"
    );

  // Get incident statistics by status
  const incidentsByStatus = await Incident.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get incidents by hour for today (for charts)
  const incidentsByHour = await Incident.aggregate([
    {
      $match: {
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return {
    stats: {
      activeIncidents,
      availableFirefighters,
      averageResponseTime,
      incidentsToday,
      totalFirefighters,
      busyFirefighters,
    },
    recentActivity: recentIncidents,
    charts: {
      incidentsByStatus,
      incidentsByHour,
    },
  };
};

export const getIncidentAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = "7d" } = req.query;

    const startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const analytics = await Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
          avgTemperature: { $avg: "$temperature" },
          avgDistance: { $avg: "$distance" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    res.json({
      success: true,
      data: analytics,
      period,
    });
  } catch (error) {
    next(error);
  }
};

export const getResponseTimeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const responseTimeStats = await Incident.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $exists: true },
          completedAt: { $exists: true },
        },
      },
      {
        $addFields: {
          responseTimeMinutes: {
            $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTimeMinutes" },
          minResponseTime: { $min: "$responseTimeMinutes" },
          maxResponseTime: { $max: "$responseTimeMinutes" },
          totalIncidents: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: responseTimeStats[0] || {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        totalIncidents: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
