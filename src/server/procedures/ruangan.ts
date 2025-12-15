import { asc, eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { bangsal, ruangan, treatmentClass } from "@/db/schema";
import {
  BangsalCreateSchema,
  RuanganCreateSchema,
  TreatmentClassCreateSchema,
} from "@/schemas/ruangan";

import { adminOnly, authorized } from "../middleware";
import { handleORPCError } from "../utils";

export const ruanganProcedure = {
  getAll: authorized
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

  create: adminOnly
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

  update: adminOnly
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
        console.log(error);
        handleORPCError(error);
      }
    }),

  delete: adminOnly
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
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.bangsal.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  getAllWithRuangan: authorized
    .route({ path: "/", method: "GET" })
    .handler(async () => {
      try {
        const rows = await db
          .select()
          .from(bangsal)
          .leftJoin(ruangan, eq(bangsal.id, ruangan.bangsalId))
          .leftJoin(
            treatmentClass,
            eq(ruangan.treatmentClassId, treatmentClass.id)
          )
          .orderBy(asc(bangsal.id));

        // const result = Array.from(
        //   Map.groupBy(rows, (row) => row.bangsal.id),
        //   ([, group]) => ({
        //     bangsal: group[0].bangsal,
        //     ruanganList: group.map((row) => ({
        //       ...row.ruangan,
        //       treatmentClass: row.treatment_class,
        //     })),
        //   })
        // );

        return rows;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  create: adminOnly
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

  update: adminOnly
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

  delete: adminOnly
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

  syncFromSimrs: adminOnly
    .route({ path: "/", method: "POST" })
    .handler(async ({ input }) => {}),
};

export const treatmentClassProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.treatmentClass.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
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
