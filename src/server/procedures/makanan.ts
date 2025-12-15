import { asc, DrizzleError, eq, sql } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  bahanMakanan,
  makanan,
  makananResepDetail,
  makananType,
} from "@/db/schema";
import {
  MakananCreateSchema,
  MakananTypeCreateSchema,
} from "@/schemas/makanan";

import { adminOnly, authorized } from "../middleware";
import { handleORPCError } from "../utils";

const makananProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db
        .select()
        .from(makanan)
        .innerJoin(makananType, eq(makanan.makananTypeId, makananType.id))
        .innerJoin(
          makananResepDetail,
          eq(makanan.id, makananResepDetail.makananId)
        )
        .innerJoin(
          bahanMakanan,
          eq(makananResepDetail.bahanMakananId, bahanMakanan.id)
        )
        .orderBy(asc(makanan.name), asc(bahanMakanan.name));

      const result = Array.from(
        Map.groupBy(rows, (row) => row.makanan.id),
        ([, group]) => ({
          makanan: group[0].makanan,
          makananType: group[0].makanan_type,
          makananResepDetail: group.map((row) => ({
            ...row.bahan_makanan,
            quantity: row.makanan_resep_detail.quantity,
          })),
        })
      );

      return result;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
    .route({ path: "/", method: "POST" })
    .input(MakananCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [newMakanan] = await tx
            .insert(makanan)
            .values({
              name: input.name,
              makananTypeId: input.makananTypeId,
            })
            .returning();

          const makananResepDetailInput = input.makananResepDetail.map(
            (detail) => ({
              ...detail,
              makananId: newMakanan.id,
            })
          );
          const newMakananResepDetail = await tx
            .insert(makananResepDetail)
            .values(makananResepDetailInput)
            .returning();

          return {
            makanan: newMakanan,
            makananResepDetail: newMakananResepDetail,
          };
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: adminOnly
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: MakananCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          await tx
            .update(makanan)
            .set({
              name: input.body.name,
              makananTypeId: input.body.makananTypeId,
            })
            .where(eq(makanan.id, input.params.id));

          await tx
            .delete(makananResepDetail)
            .where(eq(makananResepDetail.makananId, input.params.id));

          const makananResepDetailInput = input.body.makananResepDetail.map(
            (detail) => ({
              ...detail,
              makananId: input.params.id,
            })
          );
          if (input.body.makananResepDetail.length > 0) {
            await tx
              .insert(makananResepDetail)
              .values(makananResepDetailInput)
              .onConflictDoUpdate({
                target: [
                  makananResepDetail.makananId,
                  makananResepDetail.bahanMakananId,
                ],
                set: {
                  quantity: sql.raw(
                    `excluded.${makananResepDetail.quantity.name}`
                  ),
                },
              });
          }

          const updatedRows = await tx
            .select()
            .from(makanan)
            .innerJoin(makananType, eq(makanan.makananTypeId, makananType.id))
            .innerJoin(
              makananResepDetail,
              eq(makanan.id, makananResepDetail.makananId)
            )
            .innerJoin(
              bahanMakanan,
              eq(makananResepDetail.bahanMakananId, bahanMakanan.id)
            )
            .where(eq(makanan.id, input.params.id));

          const [updatedRowsGrouped] = Array.from(
            Map.groupBy(updatedRows, (row) => row.makanan.id),
            ([, group]) => ({
              makanan: group[0].makanan,
              makananType: group[0].makanan_type,
              makananResepDetail: group.map((row) => ({
                ...row.bahan_makanan,
                quantity: row.makanan_resep_detail.quantity,
              })),
            })
          );

          return updatedRowsGrouped;
        });
      } catch (error) {
        console.log(error);
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
        const [deletedRow] = await db
          .delete(makanan)
          .where(eq(makanan.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

const makananTypeProcedure = {
  getAll: authorized.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.makananType.findMany({
        orderBy: (makananType, { asc }) => [asc(makananType.id)],
      });

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: adminOnly
    .route({ path: "/", method: "POST" })
    .input(MakananTypeCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRow] = await db
          .insert(makananType)
          .values({
            code: input.code,
            name: input.name,
          })
          .returning();

        return newRow;
      } catch (error) {
        console.log(error instanceof DrizzleError);
        handleORPCError(error);
      }
    }),

  update: adminOnly
    .route({ path: "/{id}", method: "PUT" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: MakananTypeCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedRow] = await db
          .update(makananType)
          .set({
            code: input.body.code,
            name: input.body.name,
          })
          .where(eq(makananType.id, input.params.id))
          .returning();

        return updatedRow;
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
        const [deletedRow] = await db
          .delete(makananType)
          .where(eq(makananType.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

export { makananProcedure, makananTypeProcedure };
