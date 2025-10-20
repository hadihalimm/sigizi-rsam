import { bahanMakananProcedure } from "./procedures/bahan-makanan";
import { dietProcedure } from "./procedures/diet";
import { makananProcedure, makananTypeProcedure } from "./procedures/makanan";
import { snackProcedure } from "./procedures/snack";

export const router = {
  bahanMakanan: bahanMakananProcedure,
  makanan: makananProcedure,
  makananType: makananTypeProcedure,
  snack: snackProcedure,
  diet: dietProcedure,
};
