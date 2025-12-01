import z from "zod";

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
