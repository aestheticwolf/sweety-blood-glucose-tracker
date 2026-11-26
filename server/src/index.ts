import express from "express";
import cors from "cors";
import { pool } from "./database/connection.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Sweety API is running" });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, current_user AS user, NOW() AS time"
    );

    res.json({
      status: "connected",
      message: "Database connection successful",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety API running on http://localhost:${PORT}`);
});