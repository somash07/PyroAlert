import mongoose, { Schema, Document } from "mongoose";


export interface InquiryFormDocument extends Document {
  name: string;
  phone: string;
  email: string;
  message: string;
}


const InquiryFormSchema = new Schema<InquiryFormDocument>(
  {
    name: { type: String, required: [true, "Name is required"] },
    phone: { type: String},
    email: { type: String, required: [true, "Email is required "] },
    message: {type: String, required: [true, "Message is required"]}
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const InquiryForm = mongoose.model<InquiryFormDocument>(
  "InquiryForm",
  InquiryFormSchema
);
