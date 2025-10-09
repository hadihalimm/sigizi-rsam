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
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { diet } from "./diet";
import { makananType } from "./makanan";
import { pasien } from "./pasien";
import { ruangan } from "./ruangan";

export const dailyPermintaanMakanan = pgTable(
  "daily_permintaan_makanan",
  {
    id: serial("id").primaryKey(),
    day: date("day").notNull(),
    pasienId: integer("pasien_id")
      .notNull()
      .references(() => pasien.id, { onDelete: "no action" }),
    ruanganId: integer("ruangan_id")
      .notNull()
      .references(() => ruangan.id, { onDelete: "no action" }),
    makananTypeId: integer("makanan_type_id")
      .notNull()
      .references(() => makananType.id, { onDelete: "no action" }),
    isTerlambat: boolean("is_terlambat").notNull(),
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
  }
);

export const dailyPermintaanMakananLog = pgTable(
  "daily_permintaan_makanan_log",
  {
    id: serial("id").primaryKey(),
    pasienName: text("pasien_name"),
    ruanganName: text("ruangan_name"),
    bangsalName: text("bangsal_name"),
    field: text("field").notNull(),
    operation: text("operation").notNull(),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    performedBy: text("performed_by").notNull(),
  },
  (table) => [
    index("daily_permintaan_makanan_log_changed_at_idx").on(table.changedAt),
  ]
);
