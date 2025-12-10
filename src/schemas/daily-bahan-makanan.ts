import z from "zod";

export const DailyBahanMakananCreateSchema = z.object({
  bahanMakananId: z.number(),
  dailyBahanMakanan: z.array(
    z.object({
      date: z.string(),
      bahanMakananId: z.number(),
      treatmentClassId: z.number(),
      quantity: z.number().nonnegative(),
    })
  ),
});

export const DailyBahanMakananUpdateSchema = z.object({
  dailyBahanMakanan: z.array(
    z.object({
      date: z.string(),
      bahanMakananId: z.number(),
      treatmentClassId: z.number(),
      quantity: z.number().nonnegative(),
    })
  ),
});
