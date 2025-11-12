import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { diet } from "./diet";
import { makananType } from "./makanan";
import { pasien } from "./pasien";
import { bangsal, ruangan } from "./ruangan";

export const dailyPermintaanMakanan = pgTable(
  "daily_permintaan_makanan",
  {
    id: serial("id").primaryKey(),
    day: date("day", { mode: "date" }).notNull(),
    pasienId: integer("pasien_id")
      .notNull()
      .references(() => pasien.id, { onDelete: "no action" }),
    ruanganId: integer("ruangan_id")
      .notNull()
      .references(() => ruangan.id, { onDelete: "no action" }),
    makananTypeId: integer("makanan_type_id")
      .notNull()
      .references(() => makananType.id, { onDelete: "no action" }),
    note: text("note"),
    isTerlambat: boolean("is_terlambat").notNull(),
    pendampingCount: integer("pendamping_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("permintaan_date_idx").on(table.day),
    uniqueIndex("permintaan_date_pasien_id_idx").on(table.day, table.pasienId),
  ]
);

export const dailyPermintaanMakananDiet = pgTable(
  "daily_permintaan_makanan_diet",
  {
    id: serial("id").primaryKey(),
    dailyPermintaanMakananId: integer("daily_permintaan_makanan_id")
      .notNull()
      .references(() => dailyPermintaanMakanan.id, { onDelete: "cascade" }),
    dietId: integer("diet_id")
      .notNull()
      .references(() => diet.id, { onDelete: "no action" }),
  },
  (t) => [unique().on(t.dailyPermintaanMakananId, t.dietId)]
);

export const dailyPermintaanMakananLog = pgTable(
  "daily_permintaan_makanan_log",
  {
    id: serial("id").primaryKey(),
    pasienId: integer("pasien_id").references(() => pasien.id, {
      onDelete: "set null",
    }),
    ruanganId: integer("ruangan_id").references(() => ruangan.id, {
      onDelete: "set null",
    }),
    bangsalId: integer("bangsal_id").references(() => bangsal.id, {
      onDelete: "set null",
    }),
    operation: text("operation").notNull(),
    oldValue: jsonb("old_value").$type<PermintaanMakananLogValue>(),
    newValue: jsonb("new_value").$type<PermintaanMakananLogValue>(),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    performedByUserId: text("performed_by_user_id").notNull(),
  },
  (table) => [
    index("daily_permintaan_makanan_log_changed_at_idx").on(table.changedAt),
  ]
);

interface PermintaanMakananLogValue {
  makananTypeId?: number;
  ruanganId?: number;
  bangsalId?: number;
  dietIds?: number[];
}
