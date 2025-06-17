"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import errorHandler from "./middlewares/errorHandler";
const user_route_1 = require("./routes/user.route");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static("public"));
// public routes
app.use("/api/v1/user", user_route_1.userRoute);
// app.use("/api/v1/donate", donationRoute);
// routes that needs authentication
// app.use(authenticateWithJwt);
// app.use("/api/v1/profile", profileRoute);
// app.use("/api/v1/rescue-posts", rescuePostRoute);
// app.use("/api/v1/adoption-posts", adoptionPostRoute);
// app.use("/api/v1/volunteer-posts", volunteerPostRoute);
// app.use(errorHandler);
exports.default = app;
