import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { diet } from "@/db/schema";
import { DietCreateSchema } from "@/schemas/diet";

import { adminOnly, authorized } from "../middleware";
import { handleORPCError } from "../utils";

export const dietProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.diet.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
    .route({ path: "/", method: "POST" })
    .input(DietCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newDiet] = await db
          .insert(diet)
          .values({
            code: input.code,
            name: input.name,
          })
          .returning();

        return newDiet;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: adminOnly
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: DietCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedRow] = await db
          .update(diet)
          .set({
            ...input.body,
          })
          .where(eq(diet.id, input.params.id))
          .returning();

        return updatedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: adminOnly
    .route({ path: "/{id}", method: "DELETE" })
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const [deletedRow] = await db
          .delete(diet)
          .where(eq(diet.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
