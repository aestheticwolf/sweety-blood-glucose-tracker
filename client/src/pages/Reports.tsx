import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarDays,
  FileText,
} from "lucide-react";

import axios from "axios";
import { useEffect, useState } from "react";
import reportService, { type ReportData } from "../services/reportService";
import type { ReadingSlot } from "../services/readingService";

type ReportType = "daily" | "monthly" | "previous-month";

const reportOptions: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Month to Date" },
  { value: "previous-month", label: "Previous Month" },
];

const slotLabels: Record<ReadingSlot, string> = {
  morning: "Morning (Fasting)",
  after_breakfast: "After Breakfast",
  after_lunch: "After Lunch",
  after_dinner: "After Dinner",
};

const emptyMessages: Record<ReportType, { title: string; subtitle: string }> = {
  daily: {
    title: "No readings found for this date",
    subtitle: "Try selecting another date or add a reading for this day.",
  },
  monthly: {
    title: "No readings found for this month-to-date period",
    subtitle:
      "Readings logged between the start of the selected month and the selected date will appear here.",
  },
  "previous-month": {
    title: "No readings found for the previous month",
    subtitle:
      "No glucose measurements were recorded during the previous complete calendar month.",
  },
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateValue: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Reports() {
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportType !== "previous-month" && !selectedDate) {
      setReport(null);
      setError("Please select a valid date.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setReport(null);

      try {
        let data: ReportData;

        if (reportType === "daily") {
          data = await reportService.getDailyReport(
            selectedDate,
            controller.signal,
          );
        } else if (reportType === "monthly") {
          data = await reportService.getMonthlyReport(
            selectedDate,
            controller.signal,
          );
        } else {
          data = await reportService.getPreviousMonthReport(controller.signal);
        }

        if (isCurrent) {
          setReport(data);
        }
      } catch (err: unknown) {
        if (!isCurrent || axios.isCancel(err)) {
          return;
        }

        const apiError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setReport(null);
        setError(
          apiError.response?.data?.message ||
            "Failed to load report. Please try again.",
        );
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [reportType, selectedDate]);

  const reportReadings = report?.readings ?? [];
  const stats = report?.stats;

  const reportStats = [
    {
      label: "Highest Reading",
      value: stats?.highest ?? "--",
      unit: "mg/dL",
      icon: TrendingUp,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Lowest Reading",
      value: stats?.lowest ?? "--",
      unit: "mg/dL",
      icon: TrendingDown,
      style: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Average Reading",
      value:
        stats?.average !== null && stats?.average !== undefined
          ? stats.average.toFixed(1)
          : "--",
      unit: "mg/dL",
      icon: Activity,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Readings",
      value: stats?.total ?? 0,
      unit: "readings",
      icon: BarChart3,
      style: "bg-teal-50 text-teal-600",
    },
  ];

  const getPeriodLabel = () => {
    if (report?.period) {
      if (reportType === "daily") {
        return `Date: ${formatDisplayDate(report.period.from)}`;
      }
      return `Period: ${formatDisplayDate(report.period.from)} – ${formatDisplayDate(report.period.to)}`;
    }

    if (reportType === "daily" && selectedDate) {
      return `Date: ${formatDisplayDate(selectedDate)}`;
    }

    if (reportType === "monthly" && selectedDate) {
      const monthStart = `${selectedDate.slice(0, 7)}-01`;
      return `Period: ${formatDisplayDate(monthStart)} – ${formatDisplayDate(selectedDate)}`;
    }

    return "Previous complete calendar month";
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your glucose readings and track your progress over time.
        </p>
      </div>

      {/* Report Period Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Report Period</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the period you want to review.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {reportOptions.map((option) => {
              const isActive = reportType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReportType(option.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Date Selector (hidden for Previous Month) */}
          {reportType !== "previous-month" && (
            <div className="flex flex-col gap-2 sm:w-64">
              <label
                htmlFor="report-date"
                className="text-sm font-medium text-slate-700"
              >
                {reportType === "daily" ? "Select Date" : "Select End Date"}
              </label>

              <input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          )}

          {/* Active Period Summary */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
            <CalendarDays size={16} className="text-teal-600" />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {loading ? "--" : stat.value}
                    </span>

                    <span className="text-xs text-slate-500">{stat.unit}</span>
                  </div>
                </div>

                <div className={`rounded-xl p-3 ${stat.style}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Readings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Reading Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">
                Individual readings included in this report
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Reading Slot</th>
                <th className="px-5 py-3.5">Glucose Value</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Loading report readings...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-rose-600"
                  >
                    Unable to load readings for this report.
                  </td>
                </tr>
              ) : reportReadings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {emptyMessages[reportType].title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {emptyMessages[reportType].subtitle}
                    </p>
                  </td>
                </tr>
              ) : (
                reportReadings.map((reading) => (
                  <tr key={reading.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDisplayDate(reading.reading_date)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {slotLabels[reading.slot] ?? reading.slot}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {reading.value}
                      </span>
                      <span className="ml-1 text-xs text-slate-500">mg/dL</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="mt-0.5 text-blue-600">
          <CalendarDays size={20} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            Understanding your reports
          </h3>
          <p className="mt-1 text-sm leading-6 text-blue-700">
            Reports help you review recorded measurements over different periods.
            These statistics summarize your recorded data and are not a medical
            diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
