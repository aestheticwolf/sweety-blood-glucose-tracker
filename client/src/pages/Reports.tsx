import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarDays,
  FileText,
  LineChart,
} from "lucide-react";

import axios from "axios";
import { useEffect, useState } from "react";
import reportService, { type ReportData } from "../services/reportService";
import type { GlucoseReading, ReadingSlot } from "../services/readingService";

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

const slotOrder: Record<ReadingSlot, number> = {
  morning: 0,
  after_breakfast: 1,
  after_lunch: 2,
  after_dinner: 3,
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

function getCurrentMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthEndDate(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return `${monthValue}-${String(lastDay).padStart(2, "0")}`;
}

function getDaysInMonth(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function parseReadingDay(dateValue: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return Number(dateValue.slice(8, 10));
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? 1 : parsed.getDate();
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return monthValue;

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatShortDay(monthValue: string, day: number) {
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return String(day);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [chartReadings, setChartReadings] = useState<GlucoseReading[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");
  const [activeReading, setActiveReading] = useState<GlucoseReading | null>(null);

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

  useEffect(() => {
    if (!selectedMonth || !/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    const fetchMonthlyChart = async () => {
      try {
        const data = await reportService.getMonthlyReport(
          getMonthEndDate(selectedMonth),
          controller.signal,
        );

        if (isCurrent) {
          setChartError("");
          setChartReadings(data.readings);
          setActiveReading(null);
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

        setChartReadings([]);
        setActiveReading(null);
        setChartError(
          apiError.response?.data?.message ||
            "Failed to load monthly glucose chart.",
        );
      } finally {
        if (isCurrent) {
          setChartLoading(false);
        }
      }
    };

    fetchMonthlyChart();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [selectedMonth]);

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

  // Chart layout calculations
  const chartWidth = 960;
  const chartHeight = 320;
  const padLeft = 58;
  const padRight = 26;
  const padTop = 34;
  const padBottom = 46;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  const daysInSelectedMonth = getDaysInMonth(selectedMonth);
  const maxDayX = Math.max(1, daysInSelectedMonth - 1 + 0.66);

  const values = chartReadings.map((reading) => reading.value);
  const rawMin = values.length > 0 ? Math.min(...values) : 60;
  const rawMax = values.length > 0 ? Math.max(...values) : 180;
  let yMin = Math.max(40, Math.floor((rawMin - 15) / 20) * 20);
  let yMax = Math.min(600, Math.ceil((rawMax + 15) / 20) * 20);
  if (yMax - yMin < 40) {
    yMin = Math.max(40, yMin - 20);
    yMax = Math.min(600, yMax + 20);
  }
  const ySpan = Math.max(1, yMax - yMin);

  const yTicks = Array.from({ length: 5 }, (_, index) =>
    Math.round(yMin + (ySpan * index) / 4),
  );

  const xTickDays = Array.from(
    new Set(
      [1, 5, 10, 15, 20, 25, daysInSelectedMonth].filter(
        (day) => day <= daysInSelectedMonth,
      ),
    ),
  ).sort((a, b) => a - b);

  const chartPoints = chartReadings.map((reading) => {
    const day = parseReadingDay(reading.reading_date);
    const slotOffset = (slotOrder[reading.slot] ?? 0) * 0.22;
    const xPos = Math.min(maxDayX, Math.max(0, day - 1 + slotOffset));
    const x = padLeft + (xPos / maxDayX) * plotWidth;
    const y = padTop + ((yMax - reading.value) / ySpan) * plotHeight;

    return {
      reading,
      x,
      y,
    };
  });

  const polylinePoints = chartPoints
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

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

      {/* Monthly Glucose Chart */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <LineChart size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Monthly Glucose Chart
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Daily readings for {formatMonthLabel(selectedMonth)} (mg/dL)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-48">
            <label
              htmlFor="chart-month"
              className="text-xs font-medium text-slate-500"
            >
              Select Month
            </label>

            <input
              id="chart-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedMonth(value);
                if (!value) {
                  setChartReadings([]);
                  setActiveReading(null);
                  setChartError("Please select a valid month.");
                  setChartLoading(false);
                } else {
                  setChartError("");
                  setChartLoading(true);
                }
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="p-5">
          {chartLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading monthly chart...
            </div>
          ) : chartError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {chartError}
            </div>
          ) : chartReadings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No readings recorded for {formatMonthLabel(selectedMonth)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose another month or add readings to view your glucose trend.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex min-h-8 items-center justify-between rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-600">
                {activeReading ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-800">
                      {formatDisplayDate(activeReading.reading_date)}
                    </span>
                    <span>
                      {slotLabels[activeReading.slot] ?? activeReading.slot}
                    </span>
                    <span className="font-semibold text-teal-700">
                      {activeReading.value} mg/dL
                    </span>
                  </div>
                ) : (
                  <span>
                    Hover or focus any point to inspect its date, slot, and
                    glucose value ({chartReadings.length} readings).
                  </span>
                )}
              </div>

              <div className="overflow-x-auto pb-1">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="h-auto w-full min-w-175"
                  role="img"
                  aria-label={`Monthly glucose chart for ${formatMonthLabel(selectedMonth)}`}
                >
                  {/* Y-axis unit */}
                  <text
                    x={padLeft - 10}
                    y={14}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px] font-medium"
                  >
                    mg/dL
                  </text>

                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {yTicks.map((tick) => {
                    const y = padTop + ((yMax - tick) / ySpan) * plotHeight;
                    return (
                      <g key={tick}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={chartWidth - padRight}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-400 text-[11px]"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line
                    x1={padLeft}
                    y1={padTop}
                    x2={padLeft}
                    y2={chartHeight - padBottom}
                    stroke="#cbd5e1"
                  />
                  <line
                    x1={padLeft}
                    y1={chartHeight - padBottom}
                    x2={chartWidth - padRight}
                    y2={chartHeight - padBottom}
                    stroke="#cbd5e1"
                  />

                  {/* X-Axis Date Labels */}
                  {xTickDays.map((day) => {
                    const xPos = Math.min(maxDayX, Math.max(0, day - 1));
                    const x = padLeft + (xPos / maxDayX) * plotWidth;
                    return (
                      <g key={day}>
                        <line
                          x1={x}
                          y1={padTop}
                          x2={x}
                          y2={chartHeight - padBottom}
                          stroke="#f1f5f9"
                        />
                        <line
                          x1={x}
                          y1={chartHeight - padBottom}
                          x2={x}
                          y2={chartHeight - padBottom + 5}
                          stroke="#cbd5e1"
                        />
                        <text
                          x={x}
                          y={chartHeight - padBottom + 20}
                          textAnchor="middle"
                          className="fill-slate-500 text-[11px]"
                        >
                          {formatShortDay(selectedMonth, day)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Trend Line */}
                  {chartPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#0d9488"
                      strokeOpacity="0.65"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylinePoints}
                    />
                  )}

                  {/* Data Points */}
                  {chartPoints.map(({ reading, x, y }) => {
                    const isActive = activeReading?.id === reading.id;
                    const slotName = slotLabels[reading.slot] ?? reading.slot;

                    return (
                      <circle
                        key={reading.id}
                        cx={x}
                        cy={y}
                        r={isActive ? 6 : 3.5}
                        fill={isActive ? "#0f766e" : "#ffffff"}
                        stroke="#0d9488"
                        strokeWidth={isActive ? 2.5 : 2}
                        tabIndex={0}
                        className="cursor-pointer transition-all outline-none"
                        onClick={() => setActiveReading(reading)}
                        onMouseEnter={() => setActiveReading(reading)}
                        onMouseLeave={() => setActiveReading(null)}
                        onFocus={() => setActiveReading(reading)}
                        onBlur={() => setActiveReading(null)}
                      >
                        <title>
                          {`${formatDisplayDate(reading.reading_date)} — ${slotName}: ${reading.value} mg/dL`}
                        </title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
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
