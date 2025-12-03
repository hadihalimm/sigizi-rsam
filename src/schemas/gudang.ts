import z from "zod";

export const StockBahanMakananHistoryCreateSchema = z.object({
  bahanMakananId: z.number(),
  change: z.number(),
  type: z.string(),
  note: z.string(),
});
