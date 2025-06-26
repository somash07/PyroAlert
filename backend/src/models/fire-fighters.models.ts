import mongoose, { Schema, Document, Types } from "mongoose"

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface Certification {
  name: string
  issuedDate: Date
  expiryDate: Date
}

export interface FirefighterDocument extends Document {
  name: string
  email: string
  contact: string
  status: "available" | "busy" 
  department: string
  specializations?: string[]
  yearsOfExperience?: number
  certifications?: Certification[]
  emergencyContact?: EmergencyContact
  isActive: boolean
  lastStatusUpdate: Date
  departmentId: Types.ObjectId // linked to User model (Fire Station)
  createdAt: Date
  updatedAt: Date
}

// Emergency Contact Sub-schema
const EmergencyContactSchema = new Schema<EmergencyContact>(
  {
    name: String,
    phone: String,
    relationship: String,
  },
  { _id: false }
)

const CertificationSchema = new Schema<Certification>(
  {
    name: String,
    issuedDate: Date,
    expiryDate: Date,
  },
  { _id: false }
)

// Firefighter Schema
const FirefighterSchema = new Schema<FirefighterDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Enter a valid email"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    specializations: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: [0, "Experience can't be negative"] },
    certifications: [CertificationSchema],
    emergencyContact: EmergencyContactSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User (Fire Station) reference is required"],
    },
  },
  {
    timestamps: true,
  }
)

// Update lastStatusUpdate when status changes
FirefighterSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.lastStatusUpdate = new Date()
  }
  next()
})

// Indexes for better query performance
FirefighterSchema.index({ email: 1 })
FirefighterSchema.index({ status: 1 })
FirefighterSchema.index({ departmentId: 1 })
FirefighterSchema.index({ user: 1 })
FirefighterSchema.index({ isActive: 1 })

export const Firefighter = mongoose.model<FirefighterDocument>("Firefighter", FirefighterSchema)
