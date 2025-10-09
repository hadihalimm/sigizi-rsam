import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { makanan } from "./makanan";
import { snack } from "./snack";

export const menuBook = pgTable("menu_book", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  menuOrder: integer("menu_order").notNull(),
  menuPeriod: text("menu_period").notNull(),
  menuBookId: integer("menu_book_id")
    .notNull()
    .references(() => menuBook.id, { onDelete: "cascade" }),
});

export const menuMakananDetail = pgTable("menu_makanan_detail", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .notNull()
    .references(() => menu.id, { onDelete: "cascade" }),
  makananId: integer("makanan_id")
    .notNull()
    .references(() => makanan.id, { onDelete: "cascade" }),
});

export const menuSnackDetail = pgTable("menu_snack_detail", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .notNull()
    .references(() => menu.id, { onDelete: "cascade" }),
  snackId: integer("snack_id")
    .notNull()
    .references(() => snack.id, { onDelete: "cascade" }),
});
