
import { useState } from "react";
import { X } from "lucide-react";
import type { ReadingSlot, GlucoseReading } from "../services/readingService";

interface ReadingFormProps {
  initialData?: GlucoseReading | null;
  onSubmit: (data: {
    reading_date: string;
    slot: ReadingSlot;
    value: number;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const slots: { value: ReadingSlot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "after_breakfast", label: "After Breakfast" },
  { value: "after_lunch", label: "After Lunch" },
  { value: "after_dinner", label: "After Dinner" },
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ReadingForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ReadingFormProps) {
  const [date, setDate] = useState(
    initialData?.reading_date?.split("T")[0] || getTodayDate(),
  );

  const [slot, setSlot] = useState<ReadingSlot>(
    initialData?.slot || "morning",
  );

  const [value, setValue] = useState(
    initialData ? String(initialData.value) : "",
  );

  const [error, setError] = useState("");

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!value.trim()) {
      setError("Please enter a glucose value.");
      return;
    }

    const glucoseValue = Number(value);

    if (!Number.isInteger(glucoseValue) || glucoseValue < 40 || glucoseValue > 600) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    if (date > getTodayDate()) {
      setError("Date cannot be in the future.");
      return;
    }

    try {
      await onSubmit({
        reading_date: date,
        slot,
        value: glucoseValue,
      });
   } catch (err: unknown) {
  const apiError = err as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  const message =
    apiError.response?.data?.message ||
    (err instanceof Error ? err.message : "") ||
    "Failed to save reading. Please try again.";

  setError(message);
}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Reading" : "Add Glucose Reading"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Record your blood glucose measurement.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
       <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
          {/* Date */}
          <div>
            <label
              htmlFor="reading-date"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Reading Date
            </label>

            <input
              id="reading-date"
              type="date"
              value={date}
              max={getTodayDate()}
              onChange={(e) => {
  setDate(e.target.value);
  if (error) setError("");
}}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Reading Slot */}
          <div>
            <label
              htmlFor="reading-slot"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Reading Slot
            </label>

            <select
              id="reading-slot"
              value={slot}
              onChange={(e) => {
  setSlot(e.target.value as ReadingSlot);
  if (error) setError("");
}}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              {slots.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Glucose Value */}
          <div>
            <label
              htmlFor="glucose-value"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Glucose Value
            </label>

            <div className="relative">
              <input
                id="glucose-value"
                type="number"
                min="40"
                max="600"
                step="1"
                value={value}
                onChange={(e) => {
  setValue(e.target.value);
  if (error) setError("");
}}
                placeholder="Enter glucose value"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                mg/dL
              </span>
            </div>

        <p className="mt-1.5 text-xs text-slate-400">
  Enter a value between 40 and 600 mg/dL.
</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Reading"
                  : "Save Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReadingForm;
