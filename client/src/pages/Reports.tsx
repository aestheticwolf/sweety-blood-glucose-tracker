import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarDays,
  FileText,
} from "lucide-react";

import { useEffect, useState } from "react";
import reportService, { type DailyReport } from "../services/reportService";
import readingService, { type GlucoseReading } from "../services/readingService";


function Reports() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [loading, setLoading] = useState(true);
  
  const [readings, setReadings] = useState<GlucoseReading[]>([]);

  const reportReadings = readings
  .filter((reading) => reading.reading_date.slice(0, 10) === selectedDate)
  .map((reading) => ({
    date: selectedDate,
    slot: reading.slot,
    value: reading.value,
  }));

  const reportStats = [
  {
    label: "Highest Reading",
    value: report?.highest ?? "--",
    unit: "mg/dL",
    icon: TrendingUp,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Lowest Reading",
    value: report?.lowest ?? "--",
    unit: "mg/dL",
    icon: TrendingDown,
    style: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Average Reading",
    value: report?.average ?? "--",
    unit: "mg/dL",
    icon: Activity,
    style: "bg-blue-50 text-blue-600",
  },
  {
    label: "Total Readings",
    value: report?.count ?? 0,
    unit: "readings",
    icon: BarChart3,
    style: "bg-teal-50 text-teal-600",
  },
];

 useEffect(() => {
  const fetchReport = async () => {
    setLoading(true);

    try {
      const [reportData, readingsData] = await Promise.all([
        reportService.getDailyReport(selectedDate),
        readingService.getReadings(),
      ]);

      setReport(reportData);
      setReadings(readingsData);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setReport(null);
      setReadings([]);
    } finally {
      setLoading(false);
    }
  };

  fetchReport();
}, [selectedDate]);

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
            <button className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white">
              Daily
            </button>

            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Month to Date
            </button>

            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Previous Month
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mt-5 flex flex-col gap-2 sm:max-w-xs">
          <label
            htmlFor="report-date"
            className="text-sm font-medium text-slate-700"
          >
            Select Date
          </label>

        <input
  id="report-date"
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
/>
        </div>
      </div>

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
                      {stat.value}
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
      <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
        Loading readings...
      </td>
    </tr>
  ) : reportReadings.length === 0 ? (
    <tr>
      <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
        No readings found for this date.
      </td>
    </tr>
  ) : (
    reportReadings.map((reading, index) => (
      <tr key={index} className="transition hover:bg-slate-50">
        <td className="px-5 py-4 text-sm text-slate-600">
          {reading.date}
        </td>

        <td className="px-5 py-4">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            {reading.slot}
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
