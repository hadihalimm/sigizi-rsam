import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";

import { bahanMakanan } from "./bahan-makanan";

export const makananType = pgTable("makanan_type", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const makanan = pgTable("makanan", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  makananTypeId: integer("makanan_type_id")
    .notNull()
    .references(() => makananType.id, { onDelete: "no action" }),
});

export const makananResepDetail = pgTable(
  "makanan_resep_detail",
  {
    makananId: integer("makanan_id")
      .notNull()
      .references(() => makanan.id, { onDelete: "cascade" }),
    bahanMakananId: integer("bahan_makanan_id")
      .notNull()
      .references(() => bahanMakanan.id, { onDelete: "cascade" }),
    quantity: doublePrecision("quantity").notNull(),
  },
  (t) => [primaryKey({ columns: [t.makananId, t.bahanMakananId] })]
);
