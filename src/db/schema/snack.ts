import {
  doublePrecision,
  integer,
  pgTable,
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

export const snackMakananType = pgTable("snack_makanan_type", {
  id: serial("id").primaryKey(),
  snackId: integer("snack_id")
    .notNull()
    .references(() => snack.id, { onDelete: "cascade" }),
  makananTypeId: integer("makanan_type_id")
    .notNull()
    .references(() => makananType.id, { onDelete: "no action" }),
});

export const snackDiet = pgTable("snack_diet", {
  id: serial("id").primaryKey(),
  snackId: integer("snack_id")
    .notNull()
    .references(() => snack.id, { onDelete: "cascade" }),
  dietId: integer("diet_id")
    .notNull()
    .references(() => diet.id, { onDelete: "no action" }),
});

export const snackResepDetail = pgTable("snack_resep_detail", {
  id: serial("id").primaryKey(),
  snackId: integer("snack_id")
    .notNull()
    .references(() => snack.id, { onDelete: "cascade" }),
  bahanMakananId: integer("bahan_makanan_id")
    .notNull()
    .references(() => bahanMakanan.id, { onDelete: "cascade" }),
  quantity: doublePrecision("quantity").notNull(),
});
