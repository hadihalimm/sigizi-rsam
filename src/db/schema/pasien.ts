import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";

import { alergi } from "./alergi";

export const pasien = pgTable(
  "pasien",
  {
    id: serial("id").primaryKey(),
    medicalRecordNumber: text("medical_record_number").unique().notNull(),
    name: text("name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "date" }),
  },
  (table) => [index("name_idx").on(table.name)]
);

export const pasienAlergi = pgTable(
  "pasien_alergi",
  {
    pasienId: integer("pasien_id")
      .notNull()
      .references(() => pasien.id, { onDelete: "cascade" }),
    alergiId: integer("alergi_id")
      .notNull()
      .references(() => alergi.id, { onDelete: "no action" }),
  },
  (t) => [primaryKey({ columns: [t.pasienId, t.alergiId] })]
);
