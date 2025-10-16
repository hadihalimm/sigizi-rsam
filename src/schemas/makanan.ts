import z from "zod";

export const MakananTypeCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
});

export const MakananResepDetailCreateSchema = z.object({
  bahanMakananId: z
    .string()
    .min(1, { message: "Bahan makanan ID tidak boleh kosong" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Kuantitas   harus berupa angka",
    })
    .transform((val) => Number(val)),
  quantity: z
    .string()
    .min(1, { message: "Kuantitas tidak boleh kosong" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Kuantitas harus berupa angka",
    })
    .transform((val) => Number(val)),
});

export const MakananCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  makananTypeId: z
    .string()
    .min(1, { message: "Tipe makanan tidak boleh kosong" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Standar harus berupa angka",
    })
    .transform((val) => Number(val)),
  makananResepDetail: z.array(MakananResepDetailCreateSchema),
});
