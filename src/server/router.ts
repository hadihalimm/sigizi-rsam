import { alergiProcedure } from "./procedures/alergi";
import { bahanMakananProcedure } from "./procedures/bahan-makanan";
import {
  dailyPermintaanMakananLogProcedure,
  dailyPermintaanMakananProcedure,
} from "./procedures/daily-permintaan-makanan";
import { dietProcedure } from "./procedures/diet";
import { makananProcedure, makananTypeProcedure } from "./procedures/makanan";
import { menuBookProcedure, menuProcedure } from "./procedures/menu";
import { pasienProcedure } from "./procedures/pasien";
import { bangsalProcedure, ruanganProcedure } from "./procedures/ruangan";
import { snackProcedure } from "./procedures/snack";

export const router = {
  bahanMakanan: bahanMakananProcedure,
  makanan: makananProcedure,
  makananType: makananTypeProcedure,
  snack: snackProcedure,
  diet: dietProcedure,
  menu: menuProcedure,
  menuBook: menuBookProcedure,
  pasien: pasienProcedure,
  alergi: alergiProcedure,
  bangsal: bangsalProcedure,
  ruangan: ruanganProcedure,
  dailyPermintaanMakanan: dailyPermintaanMakananProcedure,
  dailyPermintaanMakananLog: dailyPermintaanMakananLogProcedure,
};
