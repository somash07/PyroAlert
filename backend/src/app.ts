import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import errorHandler from "./middlewares/errorHandler";
import { userRoute } from "./routes/user.route";
import {clientRequestRoute } from "./routes/client-request.route"
import { authenticateWithJwt } from "./middlewares/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));

// public routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/client-request", clientRequestRoute);


// routes that needs authentication
// app.use(authenticateWithJwt);
// app.use("/api/v1/profile", profileRoute);
// app.use("/api/v1/rescue-posts", rescuePostRoute);
// app.use("/api/v1/adoption-posts", adoptionPostRoute);
// app.use("/api/v1/volunteer-posts", volunteerPostRoute);

// app.use(errorHandler);

export default app;
