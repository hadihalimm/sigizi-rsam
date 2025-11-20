import z from "zod";

export const DailyBahanMakananUpdateSchema = z.object({
  treatmentClassId: z.number(),
  bahanMakananId: z.number(),
  quantity: z.number(),
});

export const DailyBahanMakananBatchUpdateSchema = z.array(
  DailyBahanMakananUpdateSchema.extend({
    id: z.number(),
  })
);
