import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { alergi } from "@/db/schema";
import { AlergiCreateSchema } from "@/schemas/alergi";

import { adminOnly, authorized } from "../middleware";
import { handleORPCError } from "../utils";

export const alergiProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.alergi.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
    .route({ path: "/", method: "POST" })
    .input(AlergiCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newAlergi] = await db
          .insert(alergi)
          .values({
            code: input.code,
            name: input.name,
          })
          .returning();

        return newAlergi;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: adminOnly
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: AlergiCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedRow] = await db
          .update(alergi)
          .set({
            id: input.params.id,
            ...input.body,
          })
          .where(eq(alergi.id, input.params.id))
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
          .delete(alergi)
          .where(eq(alergi.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
