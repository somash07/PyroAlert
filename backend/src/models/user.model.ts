import mongoose, { Document, Schema, model } from "mongoose";

export enum UserType {
  Admin = "Admin",
  Firedepartment = "Firedepartment",
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  type: UserType;
  verifyCode: string;
  isVerified: boolean;
  verifyCodeExpiry: Date;
  refreshToken?: string;
  profile?: mongoose.Schema.Types.ObjectId;
  location?: ILocation;
}

export interface ILocation{
  lat: number,
  lng: number
}

const locationSchema: Schema<ILocation> = new Schema({
  lat: Number,
  lng: Number,
});

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    location: locationSchema,
    type: {
      type: String,
      enum: UserType,
      required: [true, "type is required"],
    },
    refreshToken: String,
    verifyCode: String,
    verifyCodeExpiry: Date,
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// (userSchema as any).pre("remove", async function (next: (err?: Error) => void) {
//   try {
//     await AdoptionPost.deleteMany({ author: this._id });
//     next();
//   } catch (err: any) {
//     next(err);
//   }
// });

export const User = model<IUser>("User", userSchema);
