import { Router } from "express";
import { authenticateToken } from "../auth/middleware.js";
import {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
} from "../readings/readings.controller.js";

const router = Router();

router.post("/", authenticateToken, createReading);

router.get("/", authenticateToken, getReadings);

router.put("/:id", authenticateToken, updateReading);

router.delete("/:id", authenticateToken, deleteReading);

export default router;