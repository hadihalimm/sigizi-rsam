import { os } from "@orpc/server";
import { and, asc, eq, notInArray, sql } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  bahanMakanan,
  diet,
  makananType,
  snack,
  snackDiet,
  snackMakananType,
  snackResepDetail,
} from "@/db/schema";
import { SnackCreateSchema } from "@/schemas/snack";

import { handleORPCError } from "../utils";

export const snackProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db
        .select()
        .from(snack)
        .innerJoin(snackMakananType, eq(snack.id, snackMakananType.snackId))
        .innerJoin(
          makananType,
          eq(snackMakananType.makananTypeId, makananType.id)
        )
        .innerJoin(snackDiet, eq(snack.id, snackDiet.snackId))
        .innerJoin(diet, eq(snackDiet.dietId, diet.id))
        .innerJoin(snackResepDetail, eq(snack.id, snackResepDetail.snackId))
        .innerJoin(
          bahanMakanan,
          eq(snackResepDetail.bahanMakananId, bahanMakanan.id)
        )
        .orderBy(asc(snack.name), asc(bahanMakanan.name));

      const result = Array.from(
        Map.groupBy(rows, (row) => row.snack.id),
        ([, group]) => ({
          snack: group[0].snack,
          makananTypeList: Array.from(
            new Map(
              group.map((row) => [
                row.snack_makanan_type.id,
                { ...row.makanan_type },
              ])
            ).values()
          ),
          dietList: Array.from(
            new Map(
              group.map((row) => [row.snack_diet.id, { ...row.diet }])
            ).values()
          ),
          snackResepDetail: Array.from(
            new Map(
              group.map((row) => [
                row.snack_resep_detail.id,
                {
                  ...row.bahan_makanan,
                  quantity: row.snack_resep_detail.quantity,
                },
              ])
            ).values()
          ),
        })
      );

      return result;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(SnackCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [newSnack] = await tx
            .insert(snack)
            .values({
              name: input.name,
            })
            .returning();

          const snackMakananTypeInput = input.makananTypeIds.map((id) => ({
            snackId: newSnack.id,
            makananTypeId: id,
          }));
          const newSnackMakananType = await tx
            .insert(snackMakananType)
            .values(snackMakananTypeInput)
            .returning();

          const snackDietInput = input.dietIds.map((id) => ({
            snackId: newSnack.id,
            dietId: id,
          }));
          const newSnackDiet = await tx
            .insert(snackDiet)
            .values(snackDietInput)
            .returning();

          const snackResepDetailInput = input.snackResepDetail.map(
            (detail) => ({
              snackId: newSnack.id,
              bahanMakananId: detail.bahanMakananId,
              quantity: detail.quantity,
            })
          );

          const newSnackResepDetail = await tx
            .insert(snackResepDetail)
            .values(snackResepDetailInput)
            .returning();

          return {
            snack: newSnack,
            snackMakananType: newSnackMakananType,
            snackDiet: newSnackDiet,
            snackResepDetail: newSnackResepDetail,
          };
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: os
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: SnackCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          await tx.update(snack).set({
            name: input.body.name,
          });

          if (input.body.makananTypeIds.length === 0) {
            await tx
              .delete(snackMakananType)
              .where(eq(snackMakananType.snackId, input.params.id));
          } else {
            await tx
              .delete(snackMakananType)
              .where(
                and(
                  eq(snackMakananType.snackId, input.params.id),
                  notInArray(
                    snackMakananType.makananTypeId,
                    input.body.makananTypeIds
                  )
                )
              );
          }

          if (input.body.dietIds.length === 0) {
            await tx
              .delete(snackDiet)
              .where(eq(snackDiet.snackId, input.params.id));
          } else {
            await tx
              .delete(snackDiet)
              .where(
                and(
                  eq(snackDiet.snackId, input.params.id),
                  notInArray(snackDiet.dietId, input.body.dietIds)
                )
              );
          }

          if (input.body.snackResepDetail.length === 0) {
            await tx
              .delete(snackResepDetail)
              .where(eq(snackResepDetail.snackId, input.params.id));
          } else {
            const bahanMakananIds = input.body.snackResepDetail.map(
              (d) => d.bahanMakananId
            );
            await tx
              .delete(snackResepDetail)
              .where(
                and(
                  eq(snackResepDetail.snackId, input.params.id),
                  notInArray(snackResepDetail.bahanMakananId, bahanMakananIds)
                )
              );
          }

          const snackMakananTypeInput = input.body.makananTypeIds.map((id) => ({
            snackId: input.params.id,
            makananTypeId: id,
          }));
          if (input.body.makananTypeIds.length > 0) {
            await tx
              .insert(snackMakananType)
              .values(snackMakananTypeInput)
              .onConflictDoNothing();
          }

          const snackDietInput = input.body.dietIds.map((id) => ({
            snackId: input.params.id,
            dietId: id,
          }));
          if (input.body.dietIds.length > 0) {
            await tx
              .insert(snackDiet)
              .values(snackDietInput)
              .onConflictDoNothing();
          }

          const snackResepDetailInput = input.body.snackResepDetail.map(
            (detail) => ({
              ...detail,
              snackId: input.params.id,
            })
          );
          if (input.body.snackResepDetail.length > 0) {
            await tx
              .insert(snackResepDetail)
              .values(snackResepDetailInput)
              .onConflictDoUpdate({
                target: [
                  snackResepDetail.snackId,
                  snackResepDetail.bahanMakananId,
                ],
                set: {
                  quantity: sql.raw(
                    `excluded.${snackResepDetail.quantity.name}`
                  ),
                },
              });
          }

          const updatedRows = await tx
            .select()
            .from(snack)
            .innerJoin(snackMakananType, eq(snack.id, snackMakananType.snackId))
            .innerJoin(
              makananType,
              eq(snackMakananType.makananTypeId, makananType.id)
            )
            .innerJoin(snackDiet, eq(snack.id, snackDiet.snackId))
            .innerJoin(diet, eq(snackDiet.dietId, diet.id))
            .innerJoin(snackResepDetail, eq(snack.id, snackResepDetail.snackId))
            .innerJoin(
              bahanMakanan,
              eq(snackResepDetail.bahanMakananId, bahanMakanan.id)
            )
            .where(eq(snack.id, input.params.id));

          const [updatedRowsGrouped] = Array.from(
            Map.groupBy(updatedRows, (row) => row.snack.id),
            ([, group]) => ({
              snack: group[0].snack,
              makananTypeList: Array.from(
                new Map(
                  group.map((row) => [
                    row.snack_makanan_type.id,
                    { ...row.makanan_type },
                  ])
                ).values()
              ),
              dietList: Array.from(
                new Map(
                  group.map((row) => [row.snack_diet.id, { ...row.diet }])
                ).values()
              ),
              snackResepDetail: Array.from(
                new Map(
                  group.map((row) => [
                    row.snack_resep_detail.id,
                    {
                      ...row.bahan_makanan,
                      quantity: row.snack_resep_detail.quantity,
                    },
                  ])
                ).values()
              ),
            })
          );

          return updatedRowsGrouped;
        });
      } catch (error) {
        console.log(error);
        handleORPCError(error);
      }
    }),

  delete: os
    .route({ path: "/{id}", method: "DELETE" })
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const [deletedRow] = await db
          .delete(snack)
          .where(eq(snack.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
