import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../database/connection.js";
import { createReadingSchema } from "./readings.validation.js";

const readingIdSchema = z.string().uuid();



export const createReading = async (req: Request, res: Response) => {
  try {
    const validation = createReadingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0]?.message,
      });
    }

    const { reading_date, slot, value } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    // Prevent future dates
    const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

    if (reading_date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    // Check duplicate reading for the same date and slot
    const existingReading = await pool.query(
      `SELECT id FROM readings
       WHERE user_id = $1 AND reading_date = $2 AND slot = $3`,
      [userId, reading_date, slot],
    );

    if (existingReading.rows.length > 0) {
      return res.status(409).json({
        message: `You already have an ${slot.replace("_", " ")} reading for this date.`,
      });
    }

    // Check maximum 4 readings per day
    const dailyCount = await pool.query(
      `SELECT COUNT(*) FROM readings
       WHERE user_id = $1 AND reading_date = $2`,
      [userId, reading_date],
    );

    if (Number(dailyCount.rows[0].count) >= 4) {
      return res.status(400).json({
        message: "You can add only 4 readings per day.",
      });
    }

    // Insert reading
    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reading_date, slot, value, created_at`,
      [userId, reading_date, slot, value],
    );

    return res.status(201).json({
      message: "Glucose reading added successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Create reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const getReadings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const rawPage = Array.isArray(req.query.page)
      ? req.query.page[0]
      : req.query.page;
    const rawLimit = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;

    const parsedPage = Number.parseInt(String(rawPage ?? ""), 10);
    const parsedLimit = Number.parseInt(String(rawLimit ?? ""), 10);

    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit >= 1
        ? Math.min(100, parsedLimit)
        : 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM readings
       WHERE user_id = $1`,
      [userId],
    );

    const totalReadings = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(totalReadings / limit);

    const result = await pool.query(
      `SELECT
  id,
  TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
  slot,
  value,
  created_at,
  updated_at
FROM readings
WHERE user_id = $1
ORDER BY reading_date DESC, created_at DESC
LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    return res.status(200).json({
      message: "Glucose readings retrieved successfully.",
      count: result.rows.length,
      readings: result.rows,
      pagination: {
        page,
        limit,
        totalReadings,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get readings error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateReading = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    if (!readingIdSchema.safeParse(id).success) {
      return res.status(400).json({
        message: "Invalid reading ID.",
      });
    }

    const validation = createReadingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0]?.message,
      });
    }

    const { reading_date, slot, value } = validation.data;

    const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

    if (reading_date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    const existingReading = await pool.query(
      `SELECT id FROM readings
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (existingReading.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    const duplicateReading = await pool.query(
      `SELECT id FROM readings
       WHERE user_id = $1
         AND reading_date = $2
         AND slot = $3
         AND id != $4`,
      [userId, reading_date, slot, id],
    );

    if (duplicateReading.rows.length > 0) {
      return res.status(409).json({
        message: `You already have an ${slot.replace("_", " ")} reading for this date.`,
      });
    }

    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           slot = $2,
           value = $3,
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, reading_date, slot, value, created_at, updated_at`,
      [reading_date, slot, value, id, userId],
    );

    return res.status(200).json({
      message: "Glucose reading updated successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Update reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};



export const deleteReading = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    if (!readingIdSchema.safeParse(id).success) {
      return res.status(400).json({
        message: "Invalid reading ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      message: "Glucose reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};