import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const alergi = pgTable("alergi", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});
