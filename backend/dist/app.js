"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = require("./routes/user.route");
const client_request_route_1 = require("./routes/client-request.route");
const routes_1 = require("./routes");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const firefighter_route_1 = require("./routes/firefighter.route");
const app = (0, express_1.default)();
exports.app = app;
const corsOptions = {
    origin: "*",
    credentials: true,
};
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
});
exports.io = io;
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static("public"));
// public routes
app.use("/api/v1/user", user_route_1.userRoute);
app.use("/api/v1/client-request", client_request_route_1.clientRequestRoute);
app.use("/api/v1/inquiry-form", routes_1.inquiryFormRoute);
app.use("/api/v1/firefighters", firefighter_route_1.fireFighterRoute);
app.use("/api/v1/alert", routes_1.alertRoutes);
