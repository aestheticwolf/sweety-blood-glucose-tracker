import api from "./api";

export type ReadingSlot =
  | "morning"
  | "after_breakfast"
  | "after_lunch"
  | "after_dinner";

export interface GlucoseReading {
  id: string;
  reading_date: string;
  slot: ReadingSlot;
  value: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReadingData {
  reading_date: string;
  slot: ReadingSlot;
  value: number;
}

export interface UpdateReadingData {
  reading_date: string;
  slot: ReadingSlot;
  value: number;
}

const readingService = {
  getReadings: async (): Promise<GlucoseReading[]> => {
    const response = await api.get("/readings");
    return response.data.readings;
  },

  createReading: async (data: CreateReadingData) => {
    const response = await api.post("/readings", data);
    return response.data;
  },

  updateReading: async (
    id: string,
    data: UpdateReadingData,
  ) => {
    const response = await api.put(`/readings/${id}`, data);
    return response.data;
  },

  deleteReading: async (id: string) => {
    const response = await api.delete(`/readings/${id}`);
    return response.data;
  },
};

export default readingService;