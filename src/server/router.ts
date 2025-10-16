import { bahanMakananProcedure } from "./procedures/bahan-makanan";
import { makananProcedure, makananTypeProcedure } from "./procedures/makanan";

export const router = {
  bahanMakanan: bahanMakananProcedure,
  makanan: makananProcedure,
  makananType: makananTypeProcedure,
};
