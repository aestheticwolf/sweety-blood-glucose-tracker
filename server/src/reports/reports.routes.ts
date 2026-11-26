import { Router } from "express";
import { authenticateToken } from "../auth/middleware.js";
import {
  getDailyReport,
  getMonthlyReport,
  getPreviousMonthReport,
} from "./reports.controller.js";

const router = Router();

router.get("/daily", authenticateToken, getDailyReport);

router.get("/monthly", authenticateToken, getMonthlyReport);

router.get("/previous-month", authenticateToken, getPreviousMonthReport);

export default router;