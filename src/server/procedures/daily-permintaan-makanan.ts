import { os } from "@orpc/server";
import { subDays } from "date-fns";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import z from "zod";

import db from "@/db";
import {
  bangsal,
  dailyPermintaanMakanan,
  dailyPermintaanMakananDiet,
  dailyPermintaanMakananLog,
  diet,
  makananType,
  pasien,
  ruangan,
  treatmentClass,
} from "@/db/schema";
import * as schema from "@/db/schema";
import { DailyPermintaanMakananCreateSchema } from "@/schemas/daily-permintaan-makanan";
import { DailyPermintaanMakananDetail } from "@/types/db";

import { handleORPCError } from "../utils";

export const dailyPermintaanMakananProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(
      z.object({
        date: z.string(),
        bangsalId: z.number().optional(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const rows = await baseQuery(db).where(
          and(
            eq(dailyPermintaanMakanan.day, new Date(input.date)),
            input.bangsalId ? eq(ruangan.bangsalId, input.bangsalId) : undefined
          )
        );

        const result = Array.from(
          Map.groupBy(rows, (row) => row.daily_permintaan_makanan.id),
          ([, group]) => ({
            dailyPermintaanMakanan: group[0].daily_permintaan_makanan,
            pasien: group[0].pasien,
            ruangan: group[0].ruangan,
            treatmentClass: group[0].treatment_class,
            bangsal: group[0].bangsal,
            makananType: group[0].makanan_type,
            dailyPermintaanMakananDietList: Array.from(
              new Map(
                group.map((row) => [
                  row.daily_permintaan_makanan_diet.dietId,
                  { ...row.diet },
                ])
              ).values()
            ),
          })
        );
        return result;
      } catch (error) {
        console.log(error);
        handleORPCError(error);
      }
    }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(DailyPermintaanMakananCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [newPermintaan] = await tx
            .insert(dailyPermintaanMakanan)
            .values({
              day: input.day,
              pasienId: input.pasienId,
              ruanganId: input.ruanganId,
              makananTypeId: input.makananTypeId,
              note: input.note,
              isTerlambat: input.isTerlambat,
            })
            .returning();

          const permintaanDietInput = input.dietIds.sort().map((id) => ({
            dailyPermintaanMakananId: newPermintaan.id,
            dietId: id,
          }));
          const newPermintaanDiet = await tx
            .insert(dailyPermintaanMakananDiet)
            .values(permintaanDietInput)
            .returning();

          return { newPermintaan, newPermintaanDiet };
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
        body: DailyPermintaanMakananCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const oldRow = await baseQuery(tx).where(
            eq(dailyPermintaanMakanan.id, input.params.id)
          );

          const [oldResult] = Array.from(
            Map.groupBy(oldRow, (row) => row.daily_permintaan_makanan.id),
            ([, group]) => ({
              dailyPermintaanMakanan: group[0].daily_permintaan_makanan,
              pasien: group[0].pasien,
              ruangan: group[0].ruangan,
              treatmentClass: group[0].treatment_class,
              bangsal: group[0].bangsal,
              makananType: group[0].makanan_type,
              dailyPermintaanMakananDietList: Array.from(
                new Map(
                  group.map((row) => [
                    row.daily_permintaan_makanan_diet.dietId,
                    { ...row.diet },
                  ])
                ).values()
              ),
            })
          );

          await tx
            .update(dailyPermintaanMakanan)
            .set({
              ruanganId: input.body.ruanganId,
              makananTypeId: input.body.makananTypeId,
              note: input.body.note,
              isTerlambat: input.body.isTerlambat,
            })
            .where(eq(dailyPermintaanMakanan.id, input.params.id));

          if (input.body.dietIds.length === 0) {
            await tx
              .delete(dailyPermintaanMakananDiet)
              .where(
                eq(
                  dailyPermintaanMakananDiet.dailyPermintaanMakananId,
                  input.params.id
                )
              );
          } else {
            await tx
              .delete(dailyPermintaanMakananDiet)
              .where(
                and(
                  eq(
                    dailyPermintaanMakananDiet.dailyPermintaanMakananId,
                    input.params.id
                  ),
                  notInArray(
                    dailyPermintaanMakananDiet.dietId,
                    input.body.dietIds
                  )
                )
              );
          }

          const permintaanDietInput = input.body.dietIds.sort().map((id) => ({
            dailyPermintaanMakananId: input.params.id,
            dietId: id,
          }));
          if (input.body.dietIds.length > 0) {
            await tx
              .insert(dailyPermintaanMakananDiet)
              .values(permintaanDietInput)
              .onConflictDoNothing();
          }

          const updatedRows = await baseQuery(tx).where(
            eq(dailyPermintaanMakanan.id, input.params.id)
          );

          const [result] = Array.from(
            Map.groupBy(updatedRows, (row) => row.daily_permintaan_makanan.id),
            ([, group]) => ({
              dailyPermintaanMakanan: group[0].daily_permintaan_makanan,
              pasien: group[0].pasien,
              ruangan: group[0].ruangan,
              treatmentClass: group[0].treatment_class,
              bangsal: group[0].bangsal,
              makananType: group[0].makanan_type,
              dailyPermintaanMakananDietList: Array.from(
                new Map(
                  group.map((row) => [
                    row.daily_permintaan_makanan_diet.dietId,
                    { ...row.diet },
                  ])
                ).values()
              ),
            })
          );

          const changes = generatePermintaanLog(oldResult, result);
          if (changes) {
            await tx.insert(dailyPermintaanMakananLog).values({
              pasienId: result.pasien.id,
              ruanganId: result.ruangan.id,
              bangsalId: result.bangsal.id,
              operation: "update",
              oldValue: changes.old,
              newValue: changes.new,
              performedByUserId: "ABC",
            });
          }

          return result;
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: os
    .route({ path: "/{id}", method: "DELETE" })
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const [deletedRow] = await db
          .delete(dailyPermintaanMakanan)
          .where(eq(dailyPermintaanMakanan.id, input.id))
          .returning();

        const [{ bangsalId }] = await db
          .select({ bangsalId: bangsal.id })
          .from(ruangan)
          .innerJoin(bangsal, eq(ruangan.bangsalId, bangsal.id))
          .where(eq(ruangan.id, deletedRow.ruanganId));
        await db.insert(dailyPermintaanMakananLog).values({
          pasienId: deletedRow.pasienId,
          ruanganId: deletedRow.ruanganId,
          bangsalId: bangsalId,
          operation: "delete",
          performedByUserId: "ABC",
        });

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  copyFromYesterday: os
    .route({ path: "/", method: "POST" })
    .input(z.object({ date: z.string() }))
    .handler(async ({ input }) => {
      try {
        const todayDate = new Date(input.date);
        const yesterdayDate = subDays(todayDate, 1);

        return await db.transaction(async (tx) => {
          const yesterdayRows = await tx
            .select()
            .from(dailyPermintaanMakanan)
            .innerJoin(
              dailyPermintaanMakananDiet,
              eq(
                dailyPermintaanMakanan.id,
                dailyPermintaanMakananDiet.dailyPermintaanMakananId
              )
            )
            .where(eq(dailyPermintaanMakanan.day, yesterdayDate));

          const yesterdayResult = Array.from(
            Map.groupBy(
              yesterdayRows,
              (row) => row.daily_permintaan_makanan.id
            ),
            ([, group]) => ({
              dailyPermintaanMakanan: group[0].daily_permintaan_makanan,
              dailyPermintaanMakananDietList: Array.from(
                new Map(
                  group.map((row) => [
                    row.daily_permintaan_makanan_diet.id,
                    { ...row.daily_permintaan_makanan_diet },
                  ])
                ).values()
              ),
            })
          );

          const newRows = await tx
            .insert(dailyPermintaanMakanan)
            .values(
              yesterdayResult.map((item) => ({
                day: todayDate,
                pasienId: item.dailyPermintaanMakanan.pasienId,
                ruanganId: item.dailyPermintaanMakanan.ruanganId,
                makananTypeId: item.dailyPermintaanMakanan.makananTypeId,
                isTerlambat: false,
                note: item.dailyPermintaanMakanan.note,
              }))
            )
            .returning({ id: dailyPermintaanMakanan.id });

          await tx.insert(dailyPermintaanMakananDiet).values(
            newRows.flatMap((newItem, index) =>
              yesterdayResult[index].dailyPermintaanMakananDietList.map(
                (diet) => ({
                  dailyPermintaanMakananId: newItem.id,
                  dietId: diet.dietId,
                })
              )
            )
          );
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

export const dailyPermintaanMakananLogProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(
      z.object({
        date: z.string(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const rows = await db
          .select({
            dailyPermintaanMakananLog,
            pasienName: pasien.name,
            ruanganName: ruangan.name,
            bangsalName: bangsal.name,
          })
          .from(dailyPermintaanMakananLog)
          .innerJoin(pasien, eq(dailyPermintaanMakananLog.pasienId, pasien.id))
          .innerJoin(
            ruangan,
            eq(dailyPermintaanMakananLog.ruanganId, ruangan.id)
          )
          .innerJoin(
            bangsal,
            eq(dailyPermintaanMakananLog.bangsalId, bangsal.id)
          )
          .where(
            eq(
              sql.raw(
                `DATE(${dailyPermintaanMakananLog.changedAt.name} AT TIME ZONE 'Asia/Jakarta')`
              ),
              input.date
            )
          )
          .orderBy(desc(dailyPermintaanMakananLog.changedAt));

        return rows;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

function baseQuery(database: NodePgDatabase<typeof schema>) {
  return database
    .select()
    .from(dailyPermintaanMakanan)
    .innerJoin(pasien, eq(dailyPermintaanMakanan.pasienId, pasien.id))
    .innerJoin(ruangan, eq(dailyPermintaanMakanan.ruanganId, ruangan.id))
    .innerJoin(bangsal, eq(ruangan.bangsalId, bangsal.id))
    .innerJoin(treatmentClass, eq(treatmentClass.id, ruangan.treatmentClassId))
    .innerJoin(
      makananType,
      eq(dailyPermintaanMakanan.makananTypeId, makananType.id)
    )
    .innerJoin(
      dailyPermintaanMakananDiet,
      eq(
        dailyPermintaanMakanan.id,
        dailyPermintaanMakananDiet.dailyPermintaanMakananId
      )
    )
    .innerJoin(diet, eq(dailyPermintaanMakananDiet.dietId, diet.id));
}

function generatePermintaanLog(
  oldValue: DailyPermintaanMakananDetail,
  newValue: DailyPermintaanMakananDetail
) {
  const changes: {
    old: Record<string, unknown>;
    new: Record<string, unknown>;
  } = { old: {}, new: {} };
  if (oldValue.ruangan.id !== newValue.ruangan.id) {
    changes.old.ruanganId = oldValue.ruangan.id;
    changes.new.ruanganId = newValue.ruangan.id;
  }
  if (oldValue.bangsal.id !== newValue.bangsal.id) {
    changes.old.bangsalId = oldValue.bangsal.id;
    changes.new.bangsalId = newValue.bangsal.id;
  }
  if (oldValue.makananType.id !== newValue.makananType.id) {
    changes.old.makananTypeId = oldValue.makananType.id;
    changes.new.makananTypeId = newValue.makananType.id;
  }

  const oldDietIds = oldValue.dailyPermintaanMakananDietList
    .map((diet) => diet.id)
    .sort();
  const newDietIds = newValue.dailyPermintaanMakananDietList
    .map((diet) => diet.id)
    .sort();
  if (oldDietIds.join(" ") !== newDietIds.join(" ")) {
    changes.old.dietIds = oldDietIds;
    changes.new.dietIds = newDietIds;
  }

  if (Object.keys(changes.old).length === 0) return null;
  return changes;
}
