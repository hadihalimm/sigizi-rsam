import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { bahanMakanan } from "@/db/schema";
import { BahanMakananCreateSchema } from "@/schemas/bahan-makanan";

import { adminOnly, authorized } from "../middleware";
import { handleORPCError } from "../utils";

export const bahanMakananProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const records = await db.query.bahanMakanan.findMany({
        orderBy: (bahanMakanan, { asc }) => [asc(bahanMakanan.name)],
      });

      return records;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
    .route({ path: "/", method: "POST" })
    .input(BahanMakananCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRecord] = await db
          .insert(bahanMakanan)
          .values({
            name: input.name,
            category: input.category,
            unit: input.unit,
            standard: input.standard,
          })
          .returning();

        return newRecord;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: adminOnly
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: BahanMakananCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const updatedRecord = await db
          .update(bahanMakanan)
          .set({
            name: input.body.name,
            category: input.body.category,
            unit: input.body.unit,
            standard: input.body.standard,
          })
          .where(eq(bahanMakanan.id, input.params.id))
          .returning();

        return updatedRecord;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: adminOnly
    .route({ path: "/{id}", method: "DELETE" })
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const [deletedRecord] = await db
          .delete(bahanMakanan)
          .where(eq(bahanMakanan.id, input.id))
          .returning();

        return deletedRecord;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
