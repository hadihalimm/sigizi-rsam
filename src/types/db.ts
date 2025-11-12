import * as schema from "@/db/schema";

export type Alergi = typeof schema.alergi.$inferSelect;

export type BahanMakanan = typeof schema.bahanMakanan.$inferSelect;

export type DailyMenu = typeof schema.dailyMenu.$inferInsert;
export type DailyMenuMakananDetail =
  typeof schema.dailyMenuMakananDetail.$inferSelect;
export type DailyMenuSnackDetail =
  typeof schema.dailyMenuSnackDetail.$inferSelect;

export type DailyPermintaanMakanan =
  typeof schema.dailyPermintaanMakanan.$inferSelect;
export type DailyPermintaanMakananDiet =
  typeof schema.dailyPermintaanMakananDiet.$inferSelect;
export type DailyPermintaanMakananLog =
  typeof schema.dailyPermintaanMakananLog.$inferSelect;

export type Diet = typeof schema.diet.$inferSelect;

export type Makanan = typeof schema.makanan.$inferSelect;
export type MakananType = typeof schema.makananType.$inferSelect;
export type MakananResepDetail = typeof schema.makananResepDetail.$inferSelect;

export type Menu = typeof schema.menu.$inferSelect;
export type MenuBook = typeof schema.menuBook.$inferSelect;
export type MenuMakananDetail = typeof schema.menuMakananDetail.$inferSelect;
export type MenuSnackDetail = typeof schema.menuSnackDetail.$inferSelect;

export type Pasien = typeof schema.pasien.$inferSelect;
export type PasienAlergi = typeof schema.pasienAlergi.$inferSelect;

export type Ruangan = typeof schema.ruangan.$inferSelect;
export type Bangsal = typeof schema.bangsal.$inferSelect;
export type TreatmentClass = typeof schema.treatmentClass.$inferInsert;

export type Snack = typeof schema.snack.$inferSelect;
export type SnackMakananType = typeof schema.snackMakananType.$inferSelect;
export type SnackDiet = typeof schema.snackDiet.$inferSelect;
export type SnackResepDetail = typeof schema.snackResepDetail.$inferSelect;

export type DailyPermintaanMakananDetail = {
  dailyPermintaanMakanan: DailyPermintaanMakanan;
  pasien: Pasien;
  ruangan: Ruangan;
  bangsal: Bangsal;
  treatmentClass: TreatmentClass;
  makananType: MakananType;
  dailyPermintaanMakananDietList: Diet[];
};
