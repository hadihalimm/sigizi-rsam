import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const diet = pgTable("diet", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});
