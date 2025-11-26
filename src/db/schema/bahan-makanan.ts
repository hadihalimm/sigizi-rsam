import { numeric, pgTable, serial, text } from "drizzle-orm/pg-core";

export const bahanMakanan = pgTable("bahan_makanan", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  standard: numeric("standard", { mode: "number" }).notNull(),
});
