"use client";

import { Ellipsis, LucideIcon } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

interface DropdownRowActionProps {
  actions: Action[];
  triggerIcon?: LucideIcon;
  align?: "end" | "center" | "start" | undefined;
}

export function DropdownRowAction({
  actions,
  triggerIcon: TriggerIcon = Ellipsis,
  align = "end",
}: DropdownRowActionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open dropdown</span>
          <TriggerIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        {actions.map((action, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={action.onClick}
            className="flex gap-2"
          >
            {action.icon && <action.icon className="size-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
