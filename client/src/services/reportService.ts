import api from "./api";

export interface DailyReport {
  date: string;
  highest: number | null;
  lowest: number | null;
  average: number | null;
  count: number;
}

const reportService = {
  getDailyReport: async (date: string): Promise<DailyReport> => {
    const response = await api.get(`/reports/daily?date=${date}`);
    return {
  date: response.data.date,
  highest: response.data.stats.highest,
  lowest: response.data.stats.lowest,
  average: response.data.stats.average,
  count: response.data.stats.total,
};
  },
};

export default reportService;