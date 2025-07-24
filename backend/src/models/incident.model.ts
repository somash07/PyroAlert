import mongoose, { Schema, type Document } from "mongoose";

export interface IIncident extends Document {
  location: string;
  alert_type: "fire" | "smoke";
  timestamp: Date;
  confidence: number;
  temperature?: number;
  source_device_id?: string;
  status:
    | "pending_response"
    | "accepted"
    | "rejected"
    | "assigned"
    | "dispatched"
    | "completed"
    | "acknowledged"
    | "unassigned";
  assigned_firefighters?: mongoose.Types.ObjectId[];
  assigned_department?: mongoose.Types.ObjectId;
  requested_department?: mongoose.Types.ObjectId;
  notes?: string;
  completion_notes?: string;
  additional_info?: Record<string, any>;
  geo_location?: {
    type: { type: string; enum: ["Point"]; default: "Point" };
    coordinates: [number, number]; // [longitude, latitude]
  };
  nearby_departments?: Array<{
    department: mongoose.Types.ObjectId;
    distance: number;
  }>;
  rejection_history?: Array<{
    department: mongoose.Types.ObjectId;
    reason: string;
    timestamp: Date;
  }>;
  response_time?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema(
  {
    location: { type: String, required: true },
    alert_type: { type: String, enum: ["fire", "smoke"], required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    confidence: { type: Number, required: true },
    temperature: { type: Number },
    source_device_id: { type: String },
    status: {
      type: String,
      enum: [
        "pending_response",
        "accepted",
        "acknowledged",
        "assigned",
        "dispatched",
        "completed",
        "rejected",
        "unassigned",
      ],
      default: "pending_response",
    },
    assigned_firefighters: [
      { type: Schema.Types.ObjectId, ref: "Firefighter" },
    ],
    assigned_department: { type: Schema.Types.ObjectId, ref: "User" },
    requested_department: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
    completion_notes: { type: String },
    additional_info: { type: Schema.Types.Mixed },
    geo_location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    nearby_departments: [
      {
        department: { type: Schema.Types.ObjectId, ref: "User" },
        distance: { type: Number },
      },
    ],
    rejection_history: [
      {
        department: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    response_time: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IIncident>("Incident", IncidentSchema);
