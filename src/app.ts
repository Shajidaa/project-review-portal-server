import cors from "cors";
import express, { Application, Request, Response } from "express";

const app: Application = express();

// 1. CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL, "http://localhost:3000"]
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Root Health Check Endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Project Review Portal Server is running successfully.",
    version: "1.0.0",
  });
});

export default app;
