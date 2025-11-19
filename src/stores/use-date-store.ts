import { create } from "zustand";

interface DateState {
  dates: Record<string, Date>;
  setDate: (key: string, date: Date) => void;
  removeDate: (key: string) => void;
  clearDates: () => void;
}

export const useDateStore = create<DateState>((set) => ({
  dates: {},
  setDate: (key, date) =>
    set((state) => ({
      dates: { ...state.dates, [key]: date },
    })),
  removeDate: (key) =>
    set((state) => {
      const newDates = { ...state.dates };
      delete newDates[key];
      return { dates: newDates };
    }),
  clearDates: () => set({ dates: {} }),
}));
