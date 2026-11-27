
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Droplets,
  Clock,
} from "lucide-react";

import { useEffect, useState } from "react";
import reportService, { type DailyReport } from "../services/reportService";
import readingService, { type GlucoseReading } from "../services/readingService";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [report, allReadings] = await Promise.all([
          reportService.getDailyReport(getTodayDate()),
          readingService.getReadings(),
        ]);

        setDailyReport(report);
        setReadings(allReadings);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summaryCards = [
  {
    title: "Today's Average",
    value: dailyReport?.average ?? "--",
    unit: "mg/dL",
    description: "Based on today's readings",
    icon: Activity,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Highest Reading",
    value: dailyReport?.highest ?? "--",
    unit: "mg/dL",
    description: "Today's highest value",
    icon: TrendingUp,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Lowest Reading",
    value: dailyReport?.lowest ?? "--",
    unit: "mg/dL",
    description: "Today's lowest value",
    icon: TrendingDown,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Readings",
    value: dailyReport?.count ?? 0,
    unit: "of 4",
    description: "Daily reading slots",
    icon: Droplets,
    color: "bg-teal-50 text-teal-600",
  },
];

 const readingSlots = [
  {
    slot: "morning",
    label: "Morning",
    time: "Before breakfast",
  },
  {
    slot: "after_breakfast",
    label: "After Breakfast",
    time: "Post meal",
  },
  {
    slot: "after_lunch",
    label: "After Lunch",
    time: "Post meal",
  },
  {
    slot: "after_dinner",
    label: "After Dinner",
    time: "Post meal",
  },
];

const today = getTodayDate();

const todayReadings = readingSlots.map((slot) => {
  const reading = readings.find(
    (item) =>
      item.reading_date?.split("T")[0] === today &&
      item.slot === slot.slot,
  );

  return {
    slot: slot.label,
    time: slot.time,
    value: reading ? String(reading.value) : "--",
    status: reading ? "Completed" : "Pending",
  };
});

 return (
  <div className="space-y-8">
    {loading && (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
        Loading dashboard data...
      </div>
    )}
      {/* Page Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your blood glucose and stay informed about your daily progress.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
          <Clock size={16} />
          Today's Overview
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      {card.value}
                    </span>
                    <span className="text-sm text-slate-500">{card.unit}</span>
                  </div>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Daily Readings */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">Today's Readings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your daily glucose tracking schedule
            </p>
          </div>

          <div className="rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
            {todayReadings.filter((reading) => reading.status === "Completed").length} of 4 completed
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {todayReadings.map((reading) => (
            <div
              key={reading.slot}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Droplets size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {reading.slot}
                  </p>
                  <p className="text-xs text-slate-500">{reading.time}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {reading.value}
                    {reading.value !== "--" && (
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        mg/dL
                      </span>
                    )}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    reading.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {reading.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="mt-0.5 text-blue-600">
          <Activity size={20} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            Keep tracking your readings
          </h3>
          <p className="mt-1 text-sm leading-6 text-blue-700">
            Recording your glucose readings consistently can help you review
            patterns over time. Your dashboard will display your data as you add
            new readings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
