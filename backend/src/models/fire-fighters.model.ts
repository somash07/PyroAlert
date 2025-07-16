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
  address: string
  status: "available" | "busy" 
  specializations?: string[]
  yearsOfExperience?: number
  certifications?: Certification[]
  emergencyContact?: EmergencyContact
  isActive: boolean
  lastStatusUpdate: Date
  departmentId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  image?: string
  password?: string
  resetPasswordToken?: string
  resetPasswordExpiry?: Date
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
     address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [50, "Address cannot exceed 50 characters"],
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
    image: {
      type: String,
      default: ""
    },
    password: {
      type: String,
      default: ""
    },
    resetPasswordToken: {
      type: String,
      default: ""
    },
    resetPasswordExpiry: {
      type: Date,
      default: null
    }
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


export const Firefighter = mongoose.model<FirefighterDocument>("Firefighter", FirefighterSchema)
