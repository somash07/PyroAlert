import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/user.route";
import {clientRequestRoute } from "./routes/client-request.route"
import { alertRoutes, inquiryFormRoute } from "./routes";
import { createServer } from "http";
import type { Request, Response, NextFunction } from "express";
import { Server as SocketIOServer } from "socket.io";
import { fireFighterRoute } from "./routes/firefighter.route";

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: corsOptions,  
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));


// public routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/client-request", clientRequestRoute);
app.use("/api/v1/inquiry-form", inquiryFormRoute)
app.use("/api/v1/firefighters", fireFighterRoute )
app.use("/api/v1/alert", alertRoutes)




// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {


  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
  });
});


// routes that needs authentication
// app.use(authenticateWithJwt);
// app.use("/api/v1/profile", profileRoute);
// app.use("/api/v1/rescue-posts", rescuePostRoute);
// app.use("/api/v1/adoption-posts", adoptionPostRoute);
// app.use("/api/v1/volunteer-posts", volunteerPostRoute);

// app.use(errorHandler);

export { app, server, io };
