import {
  useAppAlertDialogStore,
  useAppDialogStore,
} from "@/stores/use-dialog-store";

export const useAppDialog = (id: string) => {
  const { openDialog, closeDialog } = useAppDialogStore();
  const isOpen = useAppDialogStore((state) => state.dialogs[id] ?? false);
  return {
    open: () => openDialog(id),
    close: () => closeDialog(id),
    isOpen,
  };
};

export const useAppAlertDialog = (id: string) => {
  const { openDialog, closeDialog } = useAppAlertDialogStore();
  const isOpen = useAppAlertDialogStore((state) => state.dialogs[id] ?? false);
  return {
    open: () => openDialog(id),
    close: () => closeDialog(id),
    isOpen,
  };
};
