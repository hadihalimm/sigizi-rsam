import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { bahanMakanan } from "./bahan-makanan";

export const stockBahanMakanan = pgTable("stock_bahan_makanan", {
  id: serial("id").primaryKey(),
  bahanMakananId: integer()
    .notNull()
    .unique()
    .references(() => bahanMakanan.id, { onDelete: "cascade" }),
  quantity: numeric({ mode: "number" }).notNull(),
});

export const stockBahanMakananHistory = pgTable("stock_bahan_makanan_history", {
  id: serial("id").primaryKey(),
  bahanMakananId: integer()
    .notNull()
    .references(() => bahanMakanan.id, { onDelete: "cascade" }),
  change: numeric({ mode: "number" }).notNull(),
  type: text().notNull(),
  note: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
