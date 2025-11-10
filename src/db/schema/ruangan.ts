import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const bangsal = pgTable("bangsal", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  simrsCode: text("simrs_code"),
});

export const ruangan = pgTable("ruangan", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  treatmentClassId: integer("treatment_class_id")
    .notNull()
    .references(() => treatmentClass.id, { onDelete: "no action" }),
  bangsalId: integer("bangsal_id")
    .notNull()
    .references(() => bangsal.id, { onDelete: "cascade" }),
  simrsCode: text("simrs_code"),
});

export const treatmentClass = pgTable("treatment_class", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});
