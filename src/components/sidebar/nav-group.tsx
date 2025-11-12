"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function NavGroup({
  groupLabel,
  items,
}: {
  groupLabel: string;
  items: {
    title: string;
    url: string;
    icon?: any;
    isActive?: boolean;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url)
                }
                className="text-[15px] text-foreground/90 h-10"
              >
                <Link href={item.url}>
                  <div>{item.icon}</div>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
