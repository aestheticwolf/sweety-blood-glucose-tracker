import { z } from "zod";

export const createReadingSchema = z.object({
  reading_date: z.string().date("Invalid date format."),
  slot: z.enum([
    "morning",
    "after_breakfast",
    "after_lunch",
    "after_dinner",
  ]),
  value: z
    .number({
      error: "Please enter a glucose value.",
    })
    .int("Value must be between 40 and 600 mg/dl.")
    .min(40, "Value must be between 40 and 600 mg/dl.")
    .max(600, "Value must be between 40 and 600 mg/dl."),
});

export const updateReadingSchema = createReadingSchema;