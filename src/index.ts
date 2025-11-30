import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "bun";
import mongoose from "mongoose";
import { config } from "dotenv";
import userRouter from "./routes/userRoutes";
import contentRouter from "./routes/contentRoutes";
import analyticsRouter from "./routes/analyticsRoute";

config();

const MONGODB_URI = process.env.MONGODB_URI!;
const PORT = Number(process.env.PORT) || 3000;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose
  .connect(MONGODB_URI, { dbName: "company_website" })
  .then(() => {
    console.log("---------------------");
    console.log("Connected to MongoDB");
    console.log("---------------------");
  })
  .catch((err) => console.error(err));

// ------------------------------
// Hono App
// ------------------------------
const app = new Hono();

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (allowedOrigins.includes(origin)) return origin;
      return ""; // block
    },
    credentials: true,
  })
);

// Routes
app.route("/api/user", userRouter);
app.route("/api/content", contentRouter);
app.route("/api/analytics", analyticsRouter);

// Bun server
serve({
  port: PORT,
  fetch: app.fetch,
});
console.log("---------------------------------------");
console.log(`API running at http://localhost:${PORT}`);
console.log("---------------------------------------");
