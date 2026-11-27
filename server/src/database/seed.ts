import { pool } from "./connection.js";
import { hashPassword } from "../auth/auth.js";

type ReadingSlot =
  | "morning"
  | "after_breakfast"
  | "after_lunch"
  | "after_dinner";

interface SeedReading {
  reading_date: string;
  slot: ReadingSlot;
  value: number;
}

const DEMO_USER = {
  name: "Sweety Demo",
  email: "demo@sweety.app",
  password: "SweetyDemo@123",
} as const;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayInAppTimezone(): Date {
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const parts = todayStr.split("-").map(Number);
  return new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

function buildSampleReadings(): SeedReading[] {
  const today = getTodayInAppTimezone();
  const todayStr = formatDate(today);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const readings: SeedReading[] = [
    // Today (3 of 4 slots populated so manual add can also be tested)
    { reading_date: todayStr, slot: "morning", value: 96 },
    { reading_date: todayStr, slot: "after_breakfast", value: 138 },
    { reading_date: todayStr, slot: "after_lunch", value: 146 },
  ];

  // Earlier dates in the current month (strictly before today, never future)
  const earlierDays = Array.from(
    new Set(
      [1, Math.floor(currentDay / 2), currentDay - 2, currentDay - 1].filter(
        (day) => day >= 1 && day < currentDay,
      ),
    ),
  ).sort((a, b) => a - b);

  const currentMonthValues: { slot: ReadingSlot; base: number }[] = [
    { slot: "morning", base: 92 },
    { slot: "after_breakfast", base: 132 },
    { slot: "after_lunch", base: 144 },
    { slot: "after_dinner", base: 129 },
  ];

  earlierDays.forEach((day, index) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    currentMonthValues.forEach((entry, slotIndex) => {
      readings.push({
        reading_date: dateStr,
        slot: entry.slot,
        value: entry.base + ((index * 5 + slotIndex * 3) % 19),
      });
    });
  });

  // Previous complete calendar month
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays = Array.from(
    new Set([2, 9, 16, 23, prevMonthLastDay].filter((d) => d <= prevMonthLastDay)),
  );

  const prevMonthValues: { slot: ReadingSlot; base: number }[] = [
    { slot: "morning", base: 98 },
    { slot: "after_breakfast", base: 140 },
    { slot: "after_lunch", base: 152 },
    { slot: "after_dinner", base: 134 },
  ];

  prevMonthDays.forEach((day, index) => {
    const dateStr = formatDate(new Date(prevYear, prevMonth, day));
    prevMonthValues.forEach((entry, slotIndex) => {
      readings.push({
        reading_date: dateStr,
        slot: entry.slot,
        value: entry.base + ((index * 4 + slotIndex * 6) % 21),
      });
    });
  });

  return readings;
}

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalizedEmail = DEMO_USER.email.trim().toLowerCase();

    const existingUser = await client.query<{ id: string }>(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [normalizedEmail],
    );

    let demoUserId: string;
    let userCreated = false;

    if (existingUser.rows.length > 0 && existingUser.rows[0]) {
      demoUserId = existingUser.rows[0].id;
    } else {
      const passwordHash = await hashPassword(DEMO_USER.password);

      const insertedUser = await client.query<{ id: string }>(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (LOWER(email)) DO NOTHING
         RETURNING id`,
        [DEMO_USER.name, normalizedEmail, passwordHash],
      );

      if (insertedUser.rows.length > 0 && insertedUser.rows[0]) {
        demoUserId = insertedUser.rows[0].id;
        userCreated = true;
      } else {
        const refetched = await client.query<{ id: string }>(
          "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
          [normalizedEmail],
        );
        if (!refetched.rows[0]) {
          throw new Error("Failed to resolve demo user ID after insert.");
        }
        demoUserId = refetched.rows[0].id;
      }
    }

    const sampleReadings = buildSampleReadings();
    let insertedCount = 0;
    let skippedCount = 0;

    for (const reading of sampleReadings) {
      const result = await client.query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
        [demoUserId, reading.reading_date, reading.slot, reading.value],
      );

      if ((result.rowCount ?? 0) > 0) {
        insertedCount += 1;
      } else {
        skippedCount += 1;
      }
    }

    await client.query("COMMIT");

    console.log(
      userCreated
        ? `Created demo user: ${normalizedEmail}`
        : `Demo user already exists: ${normalizedEmail}`,
    );
    console.log(
      `Seeded readings complete: ${insertedCount} inserted, ${skippedCount} already existed.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void seed();
