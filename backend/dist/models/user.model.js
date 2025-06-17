"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserType;
(function (UserType) {
    UserType["FireDepartment"] = "fireDepartment";
    UserType["Admin"] = "admin";
})(UserType || (exports.UserType = UserType = {}));
const userSchema = new mongoose_1.Schema({
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
    type: {
        type: String,
        enum: UserType,
        required: [true, "type is required"],
    },
    refreshToken: String,
    verifyCode: String,
    verifyCodeExpiry: Date,
    profile: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Profile",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// (userSchema as any).pre("remove", async function (next: (err?: Error) => void) {
//   try {
//     await AdoptionPost.deleteMany({ author: this._id });
//     next();
//   } catch (err: any) {
//     next(err);
//   }
// });
exports.User = (0, mongoose_1.model)("User", userSchema);
