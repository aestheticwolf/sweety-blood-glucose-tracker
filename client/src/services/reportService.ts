import api from "./api";
import type { GlucoseReading } from "./readingService";

export interface ReportStats {
  highest: number | null;
  lowest: number | null;
  average: number | null;
  total: number;
}

export interface ReportPeriod {
  from: string;
  to: string;
}

export interface ReportData {
  period: ReportPeriod;
  stats: ReportStats;
  readings: GlucoseReading[];
}

export interface DailyReport extends ReportData {
  date: string;
  highest: number | null;
  lowest: number | null;
  average: number | null;
  count: number;
}

interface DailyReportApiResponse {
  date: string;
  stats: ReportStats;
  readings: GlucoseReading[];
}

interface PeriodReportApiResponse {
  period: ReportPeriod;
  stats: ReportStats;
  readings: GlucoseReading[];
}

const reportService = {
  getDailyReport: async (
    date: string,
    signal?: AbortSignal,
  ): Promise<DailyReport> => {
    const response = await api.get<DailyReportApiResponse>("/reports/daily", {
      params: { date },
      ...(signal ? { signal } : {}),
    });

    const { date: reportDate, stats, readings } = response.data;

    return {
      date: reportDate,
      period: {
        from: reportDate,
        to: reportDate,
      },
      stats,
      readings: readings ?? [],
      highest: stats.highest,
      lowest: stats.lowest,
      average: stats.average,
      count: stats.total,
    };
  },

  getMonthlyReport: async (
    date: string,
    signal?: AbortSignal,
  ): Promise<ReportData> => {
    const response = await api.get<PeriodReportApiResponse>(
      "/reports/monthly",
      {
        params: { date },
        ...(signal ? { signal } : {}),
      },
    );

    return {
      period: response.data.period,
      stats: response.data.stats,
      readings: response.data.readings ?? [],
    };
  },

  getPreviousMonthReport: async (
    signal?: AbortSignal,
  ): Promise<ReportData> => {
    const response = await api.get<PeriodReportApiResponse>(
      "/reports/previous-month",
      signal ? { signal } : undefined,
    );

    return {
      period: response.data.period,
      stats: response.data.stats,
      readings: response.data.readings ?? [],
    };
  },
};

export default reportService;