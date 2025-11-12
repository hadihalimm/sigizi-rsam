"use client";

import { useState } from "react";

import { useAppAlertDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface AppAlertDialogProps {
  id: string;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  onAction?: () => void | Promise<void>;
  actionClassName?: string;
}

export default function AppAlertDialog({
  id,
  trigger,
  title = "Apakah anda yakin?",
  description,
  onAction,
  actionClassName,
}: AppAlertDialogProps) {
  const alertDialog = useAppAlertDialog(id);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction?.();
      alertDialog.close();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open={alertDialog.isOpen}
      onOpenChange={(open) => (open ? alertDialog.open() : alertDialog.close())}
    >
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => alertDialog.close()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "bg-destructive hover:bg-destructive/80",
              actionClassName
            )}
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? "Loading..." : "Ya, saya yakin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
