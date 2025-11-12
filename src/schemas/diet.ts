import z from "zod";

export const DietCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
});
