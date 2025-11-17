import z from "zod";

export const DailyMenuCreateSchema = z.object({
  day: z.string(),
  menuId: z.number().optional(),
});

export const DailyMenuDetailSchema = z.object({
  makananIds: z.array(z.number()),
  snackIds: z.array(z.number()),
});
