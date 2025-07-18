import mongoose from "mongoose";
import dotenv from "dotenv";
import { Firefighter } from "./models/fire-fighters.model";

// Load .env variables
dotenv.config();

const getFirefighters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const firefighters = await Firefighter.find({});
    console.log("👨‍🚒 Firefighters:", firefighters);
  } catch (error) {
    console.error("❌ Error fetching firefighters:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

getFirefighters();
