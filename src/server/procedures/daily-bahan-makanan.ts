import { os } from "@orpc/server";
import { and, asc, count, eq, sql, sum } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  bahanMakanan,
  dailyBahanMakanan,
  dailyMenu,
  dailyMenuMakananDetail,
  dailyMenuSnackDetail,
  dailyPermintaanMakanan,
  makanan,
  makananResepDetail,
  makananType,
  ruangan,
  snack,
  snackMakananType,
  snackResepDetail,
  stockBahanMakanan,
  treatmentClass,
} from "@/db/schema";
import { DailyBahanMakananUpdateSchema } from "@/schemas/daily-bahan-makanan";

import { handleORPCError } from "../utils";

export const dailyBahanMakananProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(
      z.object({
        date: z.string(),
        bahanMakananCategory: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      return await getDailyBahanMakananByDate(
        new Date(input.date),
        input.bahanMakananCategory
      );
    }),

  generateByDate: os
    .route({ path: "/", method: "POST" })
    .input(
      z.object({
        date: z.string(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const todayDate = new Date(input.date);
        const yesterdayDate = new Date(input.date);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const dailyBahanMakananMap = await generateDailyBahanMakananMap(
          yesterdayDate,
          todayDate
        );
        await db
          .delete(dailyBahanMakanan)
          .where(and(eq(dailyBahanMakanan.day, todayDate)));

        const newRows = await db
          .insert(dailyBahanMakanan)
          .values(Array.from(dailyBahanMakananMap.values()))
          .onConflictDoUpdate({
            target: [
              dailyBahanMakanan.day,
              dailyBahanMakanan.bahanMakananId,
              dailyBahanMakanan.treatmentClassId,
            ],
            set: {
              quantity: sql.raw(`excluded.${dailyBahanMakanan.quantity.name}`),
            },
          })
          .returning();

        return newRows;
      } catch (error) {
        console.error(error);
        handleORPCError(error);
      }
    }),

  updateDailyBahanMakanan: os
    .route({ path: "/", method: "PUT" })
    .input(DailyBahanMakananUpdateSchema)
    .handler(async ({ input }) => {
      const rows = await db
        .insert(dailyBahanMakanan)
        .values(
          input.dailyBahanMakanan.map((item) => ({
            ...item,
            day: new Date(item.date),
          }))
        )
        .onConflictDoUpdate({
          target: [
            dailyBahanMakanan.day,
            dailyBahanMakanan.bahanMakananId,
            dailyBahanMakanan.treatmentClassId,
          ],
          set: {
            quantity: sql.raw(`excluded.${dailyBahanMakanan.quantity.name}`),
          },
        })
        .returning();

      return rows;
    }),
};

const getDailyBahanMakananByDate = async (
  date: Date,
  bahanMakananCategory?: string
) => {
  const rows = await db
    .select()
    .from(dailyBahanMakanan)
    .innerJoin(
      bahanMakanan,
      eq(dailyBahanMakanan.bahanMakananId, bahanMakanan.id)
    )
    .innerJoin(
      treatmentClass,
      eq(dailyBahanMakanan.treatmentClassId, treatmentClass.id)
    )
    .where(
      and(
        eq(dailyBahanMakanan.day, date),
        bahanMakananCategory
          ? eq(bahanMakanan.category, bahanMakananCategory)
          : undefined
      )
    )
    .orderBy(asc(bahanMakanan.name));

  const groupedMap = Map.groupBy(rows, (row) => row.bahan_makanan.id);
  const result = Array.from(groupedMap.values()).map((item) => ({
    bahanMakanan: item[0].bahan_makanan,
    quantities: item.map((item) => ({
      treatmentClass: item.treatment_class,
      quantity: item.daily_bahan_makanan.quantity,
    })),
  }));

  return result;
};

const generateDailyBahanMakananMap = async (
  yesterdayDate: Date,
  todayDate: Date
) => {
  const permintaanCount = await db
    .select({
      makananTypeId: makananType.id,
      makananTypeCode: makananType.code,
      treatmentClassId: treatmentClass.id,
      treatmentClassCode: treatmentClass.code,
      count: count(dailyPermintaanMakanan.id),
    })
    .from(dailyPermintaanMakanan)
    .innerJoin(
      makananType,
      eq(dailyPermintaanMakanan.makananTypeId, makananType.id)
    )
    .innerJoin(ruangan, eq(dailyPermintaanMakanan.ruanganId, ruangan.id))
    .innerJoin(treatmentClass, eq(ruangan.treatmentClassId, treatmentClass.id))
    .where(eq(dailyPermintaanMakanan.day, yesterdayDate))
    .groupBy(makananType.id, treatmentClass.id);
  const [pendamping] = await db
    .select({
      sum: sum(dailyPermintaanMakanan.pendampingCount),
    })
    .from(dailyPermintaanMakanan)
    .where(eq(dailyPermintaanMakanan.day, yesterdayDate));

  const makananList = await db
    .select({ makanan, makananType, bahanMakanan })
    .from(dailyMenu)
    .innerJoin(
      dailyMenuMakananDetail,
      eq(dailyMenu.id, dailyMenuMakananDetail.dailyMenuId)
    )
    .innerJoin(makanan, eq(dailyMenuMakananDetail.makananId, makanan.id))
    .innerJoin(makananType, eq(makanan.makananTypeId, makananType.id))
    .innerJoin(makananResepDetail, eq(makanan.id, makananResepDetail.makananId))
    .innerJoin(
      bahanMakanan,
      eq(makananResepDetail.bahanMakananId, bahanMakanan.id)
    )
    .where(eq(dailyMenu.day, todayDate));
  const snackList = await db
    .select({ snack, snackMakananType, bahanMakanan })
    .from(dailyMenu)
    .innerJoin(
      dailyMenuSnackDetail,
      eq(dailyMenu.id, dailyMenuSnackDetail.dailyMenuId)
    )
    .innerJoin(snack, eq(dailyMenuSnackDetail.snackId, snack.id))
    .innerJoin(snackMakananType, eq(snack.id, snackMakananType.snackId))
    .innerJoin(snackResepDetail, eq(snack.id, snackResepDetail.snackId))
    .innerJoin(
      bahanMakanan,
      eq(snackResepDetail.bahanMakananId, bahanMakanan.id)
    )
    .where(eq(dailyMenu.day, todayDate));

  const stockBahanMakananList = await db.select().from(stockBahanMakanan);
  const stockBahanMakananMap = new Map(
    stockBahanMakananList.map((row) => [row.bahanMakananId, row])
  );

  const makananGroup = new Map(
    Array.from(
      Map.groupBy(makananList, (row) => row.makanan.makananTypeId),
      ([makananTypeId, group]) => [
        makananTypeId,
        {
          makananType: group[0].makananType,
          makanan: Array.from(
            Map.groupBy(group, (row) => row.makanan.id),
            ([, rows]) => ({
              ...rows[0].makanan,
              bahanMakananList: rows.map((row) => row.bahanMakanan),
            })
          ),
        },
      ]
    )
  );
  const snackGroup = new Map(
    Array.from(
      Map.groupBy(snackList, (row) => row.snackMakananType.makananTypeId),
      ([makananTypeId, group]) => [
        makananTypeId,
        {
          snackMakananType: group[0].snackMakananType,
          snack: Array.from(
            Map.groupBy(group, (row) => row.snack.id),
            ([, rows]) => ({
              ...rows[0].snack,
              bahanMakananList: rows.map((row) => row.bahanMakanan),
            })
          ),
        },
      ]
    )
  );

  const dailyBahanMakananMap = new Map<
    number,
    typeof dailyBahanMakanan.$inferInsert
  >();
  // Handle pendamping ruangan VIP
  const permintaanVip = permintaanCount.find(
    (item) =>
      item.makananTypeCode.toLowerCase().includes("mb") &&
      item.treatmentClassCode.toLowerCase().includes("vip")
  );
  if (permintaanVip) {
    const selectedMakananList = makananGroup.get(permintaanVip.makananTypeId);
    for (const makanan of selectedMakananList?.makanan ?? []) {
      for (const bahan of makanan.bahanMakananList) {
        const prev = dailyBahanMakananMap.get(bahan.id) ?? {
          day: todayDate,
          bahanMakananId: bahan.id,
          treatmentClassId: permintaanVip.treatmentClassId,
          quantity: 0,
        };
        dailyBahanMakananMap.set(bahan.id, {
          ...prev,
          quantity: prev.quantity! + bahan.standard * Number(pendamping.sum),
        });
      }
    }
    const selectedSnackList = snackGroup.get(permintaanVip.makananTypeId);
    for (const snack of selectedSnackList?.snack ?? []) {
      for (const bahan of snack.bahanMakananList) {
        const prev = dailyBahanMakananMap.get(bahan.id) ?? {
          day: todayDate,
          bahanMakananId: bahan.id,
          treatmentClassId: permintaanVip.treatmentClassId,
          quantity: 0,
        };
        dailyBahanMakananMap.set(bahan.id, {
          ...prev,
          quantity: prev.quantity! + bahan.standard * Number(pendamping.sum),
        });
      }
    }
  }
  for (const item of permintaanCount) {
    const selectedMakananList = makananGroup.get(item.makananTypeId);
    const selectedSnackList = snackGroup.get(item.makananTypeId);
    for (const makanan of selectedMakananList?.makanan ?? []) {
      for (const bahan of makanan.bahanMakananList) {
        const prev = dailyBahanMakananMap.get(bahan.id) ?? {
          day: todayDate,
          bahanMakananId: bahan.id,
          treatmentClassId: item.treatmentClassId,
          quantity: 0,
        };
        dailyBahanMakananMap.set(bahan.id, {
          ...prev,
          quantity: prev.quantity! + bahan.standard * item.count,
        });
      }
    }
    for (const snack of selectedSnackList?.snack ?? []) {
      for (const bahan of snack.bahanMakananList) {
        const prev = dailyBahanMakananMap.get(bahan.id) ?? {
          day: todayDate,
          bahanMakananId: bahan.id,
          treatmentClassId: item.treatmentClassId,
          quantity: 0,
        };
        dailyBahanMakananMap.set(bahan.id, {
          ...prev,
          quantity: prev.quantity! + bahan.standard * item.count,
        });
      }
    }
  }

  for (const [key, item] of dailyBahanMakananMap.entries()) {
    const stockBahanMakanan = stockBahanMakananMap.get(item.bahanMakananId);
    if (!stockBahanMakanan) {
      throw new Error("Stok Bahan makanan tidak ditemukan");
    }
    const jumlahPemesanan = Math.max(
      item.quantity - stockBahanMakanan.quantity,
      0
    );
    dailyBahanMakananMap.set(key, {
      ...item,
      quantity: jumlahPemesanan,
    });
  }

  return dailyBahanMakananMap;
};
