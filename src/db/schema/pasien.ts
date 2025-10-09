import {
  date,
  index,
  integer,
  pgTable,
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
    dateOfBirth: date("date_of_birth"),
  },
  (table) => [
    index("name_idx").on(table.name),
    index("mrn_index").on(table.medicalRecordNumber),
  ]
);

export const pasienAlergi = pgTable("pasien_alergi", {
  id: serial("id").primaryKey(),
  pasienId: integer("pasien_id")
    .notNull()
    .references(() => pasien.id, { onDelete: "cascade" }),
  alergiId: integer("alergi_id")
    .notNull()
    .references(() => alergi.id, { onDelete: "no action" }),
});
