import mongoose, { Schema, Document } from "mongoose";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface ClientRequestDocument extends Document {
  name: string;
  phone: string;
  email: string;
  buildingType: string;
  address: string;
  location: Coordinates;
  additionalInfo?: string;
  createdAt: Date;
  applicationStatus: "inactive" | "active";
}

const CoordinatesSchema = new Schema<Coordinates>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const ClientRequestSchema = new Schema<ClientRequestDocument>(
  {
    name: { type: String, required: [true, "Name is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    email: { type: String, required: [true, "Email is required "] },
    buildingType: {
      type: String,
      required: [true, "Building type  is required "],
    },
    address: { type: String },
    location: { type: CoordinatesSchema, required: true },
    additionalInfo: { type: String },
    applicationStatus: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ClientRequest = mongoose.model<ClientRequestDocument>(
  "ClientRequest",
  ClientRequestSchema
);
