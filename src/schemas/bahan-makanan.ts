import z from "zod";

export const BahanMakananCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  category: z.string().min(1, { message: "Kategori tidak boleh kosong" }),
  unit: z.string().min(1, { message: "Satuan tidak boleh kosong" }),
  standard: z
    .string()
    .min(1, { message: "Standar tidak boleh kosong" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Standar harus berupa angka",
    })
    .transform((val) => Number(val)),
});
