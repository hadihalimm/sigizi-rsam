"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { orpc } from "@/server/orpc";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserDropdown() {
  const { data: session } = useSuspenseQuery(
    orpc.auth.getSession.queryOptions()
  );
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await orpc.auth.signOut.call();
    router.push("/sign-in");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span className="text-sm font-medium">{session.user.name}</span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200 ease-in-out",
              open && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[var(--radix-dropdown-menu-trigger-width)] !h-auto"
      >
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="text-destructive" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
