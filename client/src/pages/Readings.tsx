import {
  Plus,
  Droplets,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";

import readingService, {
  type GlucoseReading,
  type PaginationMeta,
} from "../services/readingService";

import ReadingForm from "../components/ReadingForm";
import type { CreateReadingData } from "../services/readingService";

const PAGE_LIMIT = 20;

function Readings() {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_LIMIT,
    totalReadings: 0,
    totalPages: 0,
  });
  const [loggedTodayCount, setLoggedTodayCount] = useState(0);
  const [latestReading, setLatestReading] = useState<GlucoseReading | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [editingReading, setEditingReading] = useState<GlucoseReading | null>(null);
const [deletingReading, setDeletingReading] = useState<GlucoseReading | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

  const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
}).format(new Date());

  const applyPageData = (
    targetPage: number,
    data: { readings: GlucoseReading[]; pagination: PaginationMeta },
  ) => {
    if (
      data.readings.length === 0 &&
      targetPage > 1 &&
      data.pagination.totalPages < targetPage
    ) {
      setLoading(true);
      setPage(Math.max(1, data.pagination.totalPages));
      return;
    }

    setReadings(data.readings);
    setPagination(data.pagination);

    if (targetPage === 1) {
      setLoggedTodayCount(
        data.readings.filter(
          (reading) => reading.reading_date.slice(0, 10) === today,
        ).length,
      );
      setLatestReading(data.readings.length > 0 ? data.readings[0] : null);
    }
  };

  const fetchReadings = async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");
      const data = await readingService.getPaginatedReadings(
        targetPage,
        PAGE_LIMIT,
      );
      applyPageData(targetPage, data);
    } catch {
      setError("Failed to load glucose readings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadReadings = async () => {
      try {
        const data = await readingService.getPaginatedReadings(
          page,
          PAGE_LIMIT,
        );

        if (!isCurrent) return;

        setError("");
        if (
          data.readings.length === 0 &&
          page > 1 &&
          data.pagination.totalPages < page
        ) {
          setPage(Math.max(1, data.pagination.totalPages));
          return;
        }

        setReadings(data.readings);
        setPagination(data.pagination);

        if (page === 1) {
          setLoggedTodayCount(
            data.readings.filter(
              (reading) => reading.reading_date.slice(0, 10) === today,
            ).length,
          );
          setLatestReading(data.readings.length > 0 ? data.readings[0] : null);
        }
      } catch {
        if (isCurrent) {
          setError("Failed to load glucose readings.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadReadings();

    return () => {
      isCurrent = false;
    };
  }, [page, today]);

  const totalReadings = pagination.totalReadings;
  const loggedToday = loggedTodayCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Blood Glucose
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and review your glucose readings.
          </p>
        </div>

       <button
  onClick={() => {
  setEditingReading(null);
  setIsFormOpen(true);
}}
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
>
  <Plus size={18} />
  Add Reading
</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Readings</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
  {totalReadings}
</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Logged Today</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
  {loggedToday}
</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Latest Reading</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {latestReading ? latestReading.value : "--"}{" "}
<span className="text-sm font-medium text-slate-500">mg/dL</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Readings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="font-semibold text-slate-900">Reading History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your recorded glucose measurements
          </p>
        </div>

        <div className="overflow-x-auto">

          {loading && (
  <div className="px-5 py-12 text-center text-sm text-slate-500">
    Loading readings...
  </div>
)}

{!loading && error && (
  <div className="px-5 py-12 text-center text-sm text-red-600">
    {error}
  </div>
)}
          {!loading && !error && readings.length > 0 && (
  <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Reading Slot</th>
                <th className="px-5 py-3.5">Value</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {readings.map((reading) => (
                <tr key={reading.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(
  Number(reading.reading_date.slice(0, 4)),
  Number(reading.reading_date.slice(5, 7)) - 1,
  Number(reading.reading_date.slice(8, 10)),
).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {reading.slot.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900">
                      {reading.value}
                    </span>
                    <span className="ml-1 text-xs text-slate-500">mg/dL</span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {reading.created_at
  ? new Date(reading.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  : "-"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
  onClick={() => {
    setEditingReading(reading);
    setIsFormOpen(true);
  }}
  className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
  aria-label="Edit reading"
>
  <Pencil size={16} />
</button>

                      <button
  onClick={() => setDeletingReading(reading)}
  className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
  aria-label="Delete reading"
>
  <Trash2 size={16} />
</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
)}

{!loading && !error && readings.length === 0 && (
  <div className="px-5 py-12 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
      <Droplets size={22} />
    </div>

    <h3 className="font-medium text-slate-900">
      No readings yet
    </h3>

    <p className="mt-1 text-sm text-slate-500">
      Add your first glucose reading to start tracking your health.
    </p>
  </div>
)}
        </div>

        {!error && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-700">{page}</span> of{" "}
              <span className="font-medium text-slate-700">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((prev) => Math.max(1, prev - 1));
                }}
                disabled={loading || page <= 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((prev) => prev + 1);
                }}
                disabled={loading || page >= pagination.totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

     {isFormOpen && (
  <ReadingForm
    initialData={editingReading}
    onCancel={() => {
      setIsFormOpen(false);
      setEditingReading(null);
    }}
    onSubmit={async (data: CreateReadingData) => {
      try {
        setIsSubmitting(true);

        if (editingReading) {
          await readingService.updateReading(editingReading.id, data);
          setIsFormOpen(false);
          setEditingReading(null);
          await fetchReadings(page);
        } else {
          await readingService.createReading(data);
          setIsFormOpen(false);
          setEditingReading(null);

          if (page !== 1) {
            setLoading(true);
            setPage(1);
          } else {
            await fetchReadings(1);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }}
    loading={isSubmitting}
  />
)}


{deletingReading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <Trash2 size={22} />
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        Delete Reading?
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Are you sure you want to delete this glucose reading? This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setDeletingReading(null)}
          disabled={isDeleting}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

       <button
  onClick={async () => {
    if (!deletingReading) return;

    try {
      setIsDeleting(true);

      await readingService.deleteReading(deletingReading.id);

      setDeletingReading(null);
      await fetchReadings(page);
    } catch {
      setError("Failed to delete reading. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }}
  disabled={isDeleting}
  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
>
  {isDeleting ? "Deleting..." : "Delete Reading"}
</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Readings;
