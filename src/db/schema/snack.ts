import {
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";

import { bahanMakanan } from "./bahan-makanan";
import { diet } from "./diet";
import { makananType } from "./makanan";

export const snack = pgTable("snack", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const snackMakananType = pgTable(
  "snack_makanan_type",
  {
    snackId: integer("snack_id")
      .notNull()
      .references(() => snack.id, { onDelete: "cascade" }),
    makananTypeId: integer("makanan_type_id")
      .notNull()
      .references(() => makananType.id, { onDelete: "no action" }),
  },
  (t) => [primaryKey({ columns: [t.snackId, t.makananTypeId] })]
);

export const snackDiet = pgTable(
  "snack_diet",
  {
    snackId: integer("snack_id")
      .notNull()
      .references(() => snack.id, { onDelete: "cascade" }),
    dietId: integer("diet_id")
      .notNull()
      .references(() => diet.id, { onDelete: "no action" }),
  },
  (t) => [primaryKey({ columns: [t.snackId, t.dietId] })]
);

export const snackResepDetail = pgTable(
  "snack_resep_detail",
  {
    snackId: integer("snack_id")
      .notNull()
      .references(() => snack.id, { onDelete: "cascade" }),
    bahanMakananId: integer("bahan_makanan_id")
      .notNull()
      .references(() => bahanMakanan.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.snackId, t.bahanMakananId] })]
);
