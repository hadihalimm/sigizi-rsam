import { create } from "zustand";

interface DateState {
  todayDate: Date;
  setTodayDate: (date: Date) => void;
}

export const useDateStore = create<DateState>((set) => ({
  todayDate: new Date(),
  setTodayDate: (date) => set({ todayDate: date }),
}));
