import { z } from "zod";

export const clientRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Invalid phone number").max(10,"Invalid phone number"),
  email: z.string().email("Invalid email address"),
  buildingType: z.string().min(1, "Building type is required"),
  address: z.string().min(1, "Address is required"),
  location: z.object({
    lat: z.number({ required_error: "Latitude is required" }),
    lng: z.number({ required_error: "Longitude is required" }),
  }),
  additionalInfo: z.string().optional(),
});

export type Schema = z.infer<typeof clientRequestSchema>;

