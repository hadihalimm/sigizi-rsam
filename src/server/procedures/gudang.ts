import { os } from "@orpc/server";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  bahanMakanan,
  stockBahanMakanan,
  stockBahanMakananHistory,
} from "@/db/schema";
import { StockBahanMakananHistoryCreateSchema } from "@/schemas/gudang";

import { handleORPCError } from "../utils";

const stockBahanMakananProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(
      z
        .object({
          category: z.string(),
        })
        .optional()
    )
    .handler(async ({ input }) => {
      try {
        const rows = await db
          .select()
          .from(stockBahanMakanan)
          .innerJoin(
            bahanMakanan,
            eq(stockBahanMakanan.bahanMakananId, bahanMakanan.id)
          )
          .where(
            input?.category
              ? eq(bahanMakanan.category, input.category)
              : undefined
          )
          .orderBy(asc(bahanMakanan.name));

        return rows;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

const stockBahanMakananHistoryProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.select().from(stockBahanMakananHistory);
      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  getById: os
    .route({ path: "/{id}", method: "GET" })
    .input(
      z.object({
        bahanMakananId: z.number(),
        cursor: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const conditions = [
          eq(stockBahanMakananHistory.bahanMakananId, input.bahanMakananId),
        ];
        if (input.cursor) {
          conditions.push(
            lte(stockBahanMakananHistory.createdAt, new Date(input.cursor))
          );
        }
        const rows = await db
          .select()
          .from(stockBahanMakananHistory)
          .where(and(...conditions))
          .orderBy(desc(stockBahanMakananHistory.createdAt))
          .limit(10);

        const nextCursor =
          rows.length === 10
            ? rows[rows.length - 1].createdAt.toISOString()
            : null;

        return { rows, nextCursor };
      } catch (error) {
        handleORPCError(error);
      }
    }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(StockBahanMakananHistoryCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          await tx.insert(stockBahanMakananHistory).values({ ...input });

          const existing = await tx
            .select()
            .from(stockBahanMakanan)
            .where(eq(stockBahanMakanan.bahanMakananId, input.bahanMakananId))
            .limit(1);
          if (existing.length === 0) {
            const [newRow] = await tx
              .insert(stockBahanMakanan)
              .values({
                bahanMakananId: input.bahanMakananId,
                quantity: input.change,
              })
              .returning();

            return newRow;
          } else {
            const currentQty = existing[0].quantity;
            const changes =
              input.type === "IN" ? input.change : input.change * -1;
            const newQty = currentQty + changes;

            if (newQty < 0) throw new Error("Stock tidak boleh kurang dari 0");

            const [updatedRow] = await tx
              .update(stockBahanMakanan)
              .set({ quantity: newQty })
              .where(eq(stockBahanMakanan.id, existing[0].id))
              .returning();

            return updatedRow;
          }
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
export { stockBahanMakananHistoryProcedure, stockBahanMakananProcedure };
