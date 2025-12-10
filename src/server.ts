import express from "express";
import dotenv from "dotenv";
import route from "./routes";
import { connectDB } from "./database/connections/postgres.connection";
import { connectRedis } from "./database/connections/redis.connection";
import cookieParser from "cookie-parser";
import path from "path";
// Load environment variables
dotenv.config();
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/iam", route);

// Connect to the database and redis and then start the server
async function startServer() {
  try {
    // Connect PostgreSQL
    await connectDB();

    // Connect Redis
    await connectRedis();

    // Start server only after both connections succeed
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

startServer();
