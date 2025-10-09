import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const bangsal = pgTable("bangsal", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const ruangan = pgTable("ruangan", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  treatmentClass: text("treatment_class").notNull(),
  bangsalId: integer("bangsal_id")
    .notNull()
    .references(() => bangsal.id, { onDelete: "cascade" }),
});
