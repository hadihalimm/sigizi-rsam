import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

import { bahanMakanan } from "./bahan-makanan";
import { treatmentClass } from "./ruangan";

export const dailyBahanMakanan = pgTable(
  "daily_bahan_makanan",
  {
    day: date("day", { mode: "date" }).notNull(),
    bahanMakananId: integer("bahan_makanan_id")
      .notNull()
      .references(() => bahanMakanan.id, { onDelete: "cascade" }),
    treatmentClassId: integer("treatment_class_id")
      .notNull()
      .references(() => treatmentClass.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { mode: "number" }),
  },
  (table) => [
    primaryKey({
      columns: [table.day, table.bahanMakananId, table.treatmentClassId],
    }),
    index("day_idx").on(table.day),
    unique("unique_day_bahan_makanan_treatment_class").on(
      table.day,
      table.bahanMakananId,
      table.treatmentClassId
    ),
  ]
);
