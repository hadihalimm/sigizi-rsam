import z from "zod";

export const MakananTypeCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
});

export const MakananResepDetailCreateSchema = z.object({
  bahanMakananId: z.number(),
  quantity: z.number(),
});

export const MakananCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  makananTypeId: z.number(),
  makananResepDetail: z.array(MakananResepDetailCreateSchema),
});
