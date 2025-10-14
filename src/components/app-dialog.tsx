"use client";

import { useAppDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";

interface AppDialogProps {
  id: string;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function AppDialog({
  id,
  trigger,
  title,
  description,
  children,
  className,
}: AppDialogProps) {
  const dialog = useAppDialog(id);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={dialog.isOpen}
        onOpenChange={(open) => (open ? dialog.open() : dialog.close())}
      >
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className={cn("max-h-[80%] mb-6", className)}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <ScrollArea className="overflow-y-auto">{children}</ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => (open ? dialog.open() : dialog.close())}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn("gap-y-8", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh/1.5)] overflow-y-auto">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
