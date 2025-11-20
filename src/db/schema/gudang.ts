import { integer, pgTable, serial } from "drizzle-orm/pg-core";

import { bahanMakanan } from "./bahan-makanan";

export const stockBahanMakanan = pgTable("stock_bahan_makanan", {
  id: serial("id").primaryKey(),
  bahanMakananId: integer()
    .notNull()
    .references(() => bahanMakanan.id, { onDelete: "cascade" }),
  stock: integer().notNull(),
});
