import express from "express";
import dotenv from "dotenv";
import route from "./routes";
import { connectDB } from "./database/connections/postgres.connection";
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

// Connect to the database and then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
