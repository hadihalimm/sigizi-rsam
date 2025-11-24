import {
  date,
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

import { makanan } from "./makanan";
import { menu } from "./menu";
import { snack } from "./snack";

export const dailyMenu = pgTable("daily_menu", {
  id: serial("id").primaryKey(),
  day: date("day", { mode: "date" }).notNull(),
  menuId: integer("menu_id").references(() => menu.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const dailyMenuMakananDetail = pgTable(
  "daily_menu_makanan_detail",
  {
    dailyMenuId: integer("daily_menu_id")
      .notNull()
      .references(() => dailyMenu.id, { onDelete: "cascade" }),
    makananId: integer("makanan_id")
      .notNull()
      .references(() => makanan.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.dailyMenuId, t.makananId] })]
);

export const dailyMenuSnackDetail = pgTable(
  "daily_menu_snack_detail",
  {
    dailyMenuId: integer("daily_menu_id")
      .notNull()
      .references(() => dailyMenu.id, { onDelete: "cascade" }),
    snackId: integer("snack_id")
      .notNull()
      .references(() => snack.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.dailyMenuId, t.snackId] })]
);
