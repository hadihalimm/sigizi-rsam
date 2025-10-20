import z from "zod";

export const SnackResepDetailSchema = z.object({
  bahanMakananId: z.number(),
  quantity: z.number(),
});

export const SnackCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  makananTypeIds: z.array(z.number()),
  dietIds: z.array(z.number()),
  snackResepDetail: z.array(SnackResepDetailSchema),
});
