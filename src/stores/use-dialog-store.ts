import { create } from "zustand";

interface DialogState {
  dialogs: Record<string, boolean>;
  openDialog: (id: string) => void;
  closeDialog: (id: string) => void;
}

export const useAppDialogStore = create<DialogState>((set) => ({
  dialogs: {},
  openDialog: (id) =>
    set((state) => ({ dialogs: { ...state.dialogs, [id]: true } })),
  closeDialog: (id) =>
    set((state) => ({ dialogs: { ...state.dialogs, [id]: false } })),
}));

export const useAppAlertDialogStore = create<DialogState>((set) => ({
  dialogs: {},
  openDialog: (id) =>
    set((state) => ({ dialogs: { ...state.dialogs, [id]: true } })),
  closeDialog: (id) =>
    set((state) => ({ dialogs: { ...state.dialogs, [id]: false } })),
}));
