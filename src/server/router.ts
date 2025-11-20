import { alergiProcedure } from "./procedures/alergi";
import { bahanMakananProcedure } from "./procedures/bahan-makanan";
import { dailyBahanMakananProcedure } from "./procedures/daily-bahan-makanan";
import {
  dailyMenuDetailProcedure,
  dailyMenuProcedure,
} from "./procedures/daily-menu";
import {
  dailyPermintaanMakananLogProcedure,
  dailyPermintaanMakananProcedure,
} from "./procedures/daily-permintaan-makanan";
import { dietProcedure } from "./procedures/diet";
import { makananProcedure, makananTypeProcedure } from "./procedures/makanan";
import { menuBookProcedure, menuProcedure } from "./procedures/menu";
import { pasienProcedure } from "./procedures/pasien";
import {
  bangsalProcedure,
  ruanganProcedure,
  treatmentClassProcedure,
} from "./procedures/ruangan";
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
  treatmentClass: treatmentClassProcedure,
  dailyPermintaanMakanan: dailyPermintaanMakananProcedure,
  dailyPermintaanMakananLog: dailyPermintaanMakananLogProcedure,
  dailyMenu: dailyMenuProcedure,
  dailyMenuDetail: dailyMenuDetailProcedure,
  dailyBahanMakanan: dailyBahanMakananProcedure,
};
