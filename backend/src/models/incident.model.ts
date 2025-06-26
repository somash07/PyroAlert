import mongoose, { Schema, type Document } from "mongoose"

export interface IIncident extends Document {
  location: string
  alert_type: "fire" | "smoke" 
  timestamp: Date
  confidence: number
  temperature?: number
  source_device_id?: string
  status: "new" | "acknowledged" | "assigned" | "resolved" | "rejected" | "transferred"
  assigned_firefighters?: mongoose.Types.ObjectId[]
  assigned_department?: mongoose.Types.ObjectId
  notes?: string
  additional_info?: Record<string, any>
  geo_location?: {
    type: { type: string; enum: ["Point"]; default: "Point" }
    coordinates: [number, number] // [longitude, latitude]
  }
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
      enum: ["new", "acknowledged", "assigned", "resolved", "rejected", "transferred"],
      default: "new",
    },
    assigned_firefighters: [{ type: Schema.Types.ObjectId, ref: "User" }],
    assigned_department: { type: Schema.Types.ObjectId, ref: "FireDepartment" },
    notes: { type: String },
    additional_info: { type: Schema.Types.Mixed },
    geo_location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
  },
  { timestamps: true },
)

export default mongoose.model<IIncident>("Incident", IncidentSchema)
