import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../database/connection.js";

const reportDateSchema = z.string().date("Please provide a valid date.");

const getStats = (readings: { value: number }[]) => {
  if (readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      total: 0,
    };
  }

  const values = readings.map((reading) => Number(reading.value));

  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const average = Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1),
  );

  return {
    highest,
    lowest,
    average,
    total: readings.length,
  };
};

const getDailyReadings = async (
  userId: string,
  date: string,
) => {
  const result = await pool.query(
    `SELECT id, reading_date, slot, value, created_at, updated_at
     FROM readings
     WHERE user_id = $1 AND reading_date = $2
     ORDER BY
       CASE slot
         WHEN 'morning' THEN 1
         WHEN 'after_breakfast' THEN 2
         WHEN 'after_lunch' THEN 3
         WHEN 'after_dinner' THEN 4
       END`,
    [userId, date],
  );

  return result.rows;
};

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const parsedDate = reportDateSchema.safeParse(req.query.date);

    if (!parsedDate.success) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    const date = parsedDate.data;

    const readings = await getDailyReadings(userId, date);

    return res.status(200).json({
      message: "Daily report retrieved successfully.",
      date,
      stats: getStats(readings),
      readings,
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Month-to-date report
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const parsedDate = reportDateSchema.safeParse(req.query.date);

    if (!parsedDate.success) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    const date = parsedDate.data;

    const startDate = `${date.slice(0, 7)}-01`;

    const result = await pool.query(
      `SELECT id, reading_date, slot, value, created_at, updated_at
       FROM readings
       WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3
       ORDER BY reading_date ASC,
         CASE slot
           WHEN 'morning' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END`,
      [userId, startDate, date],
    );

    return res.status(200).json({
      message: "Monthly report retrieved successfully.",
      period: {
        from: startDate,
        to: date,
      },
      stats: getStats(result.rows),
      readings: result.rows,
    });
  } catch (error) {
    console.error("Monthly report error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const getPreviousMonthReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const from = formatDate(startDate);
    const to = formatDate(endDate);

    const result = await pool.query(
      `SELECT id, reading_date, slot, value, created_at, updated_at
       FROM readings
       WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3
       ORDER BY reading_date ASC,
         CASE slot
           WHEN 'morning' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END`,
      [userId, from, to],
    );

    return res.status(200).json({
      message: "Previous month report retrieved successfully.",
      period: {
        from,
        to,
      },
      stats: getStats(result.rows),
      readings: result.rows,
    });
  } catch (error) {
    console.error("Previous month report error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};