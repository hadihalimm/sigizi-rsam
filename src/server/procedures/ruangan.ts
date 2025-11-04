import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { bangsal, ruangan, treatmentClass } from "@/db/schema";
import {
  BangsalCreateSchema,
  RuanganCreateSchema,
  TreatmentClassCreateSchema,
} from "@/schemas/ruangan";

import { handleORPCError } from "../utils";

export const ruanganProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(z.object({ bangsalId: z.number().optional() }))
    .handler(async ({ input }) => {
      try {
        const rows = await db.query.ruangan.findMany({
          where: input.bangsalId
            ? eq(ruangan.bangsalId, input.bangsalId)
            : undefined,
        });

        return rows;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(RuanganCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRuangan] = await db
          .insert(ruangan)
          .values({ ...input })
          .returning();

        return newRuangan;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: os
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: RuanganCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedRuangan] = await db
          .update(ruangan)
          .set({ ...input.body })
          .where(eq(ruangan.id, input.params.id))
          .returning();

        return updatedRuangan;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: os
    .route({ path: "/{id}", method: "DELETE" })
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const [deletedRuangan] = await db
          .delete(ruangan)
          .where(eq(ruangan.id, input.id))
          .returning();

        return deletedRuangan;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

export const bangsalProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.bangsal.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(BangsalCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newBangsal] = await db
          .insert(bangsal)
          .values({ ...input })
          .returning();

        return newBangsal;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: os
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: BangsalCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedBangsal] = await db
          .update(bangsal)
          .set({ ...input.body })
          .where(eq(bangsal.id, input.params.id))
          .returning();

        return updatedBangsal;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: os
    .route({ path: "/{id}", method: "DELETE" })
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const [deletedBangsal] = await db
          .delete(bangsal)
          .where(eq(bangsal.id, input.id))
          .returning();

        return deletedBangsal;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  syncFromSimrs: os
    .route({ path: "/", method: "POST" })
    .handler(async ({ input }) => {}),
};

export const treatmentClassProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.treatmentClass.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(TreatmentClassCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRow] = await db
          .insert(treatmentClass)
          .values({ ...input })
          .returning();

        return newRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
