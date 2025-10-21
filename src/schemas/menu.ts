import z from "zod";

export const MenuBookCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
});

export const MenuCreateSchema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  menuOrder: z.number(),
  menuPeriod: z.string(),
  makananIds: z.array(z.number()),
  snackIds: z.array(z.number()),
  menuBookId: z.number(),
});
