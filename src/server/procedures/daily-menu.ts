import { os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  dailyMenu,
  dailyMenuMakananDetail,
  dailyMenuSnackDetail,
  makanan,
  menu,
  menuMakananDetail,
  menuSnackDetail,
  snack,
} from "@/db/schema";
import {
  DailyMenuCreateSchema,
  DailyMenuDetailSchema,
} from "@/schemas/daily-menu";

import { calculateMenuOrder, handleORPCError } from "../utils";

export const dailyMenuProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(z.object({ date: z.string() }))
    .handler(async ({ input }) => {
      try {
        const rows = await db
          .select()
          .from(dailyMenu)
          .leftJoin(
            dailyMenuMakananDetail,
            eq(dailyMenu.id, dailyMenuMakananDetail.dailyMenuId)
          )
          .leftJoin(makanan, eq(dailyMenuMakananDetail.makananId, makanan.id))
          .leftJoin(
            dailyMenuSnackDetail,
            eq(dailyMenu.id, dailyMenuSnackDetail.dailyMenuId)
          )
          .leftJoin(snack, eq(dailyMenuSnackDetail.snackId, snack.id))
          .leftJoin(menu, eq(dailyMenu.menuId, menu.id))
          .where(eq(dailyMenu.day, new Date(input.date)));

        const result = Array.from(
          Map.groupBy(rows, (row) => row.daily_menu.id),
          ([, group]) => ({
            dailyMenu: group[0].daily_menu,
            menu: group[0].menu,
            makananList: Array.from(
              new Map(
                group.map((row) => [row.makanan?.id, { ...row.makanan }])
              ).values()
            ),
            snackList: Array.from(
              new Map(
                group.map((row) => [row.snack?.id, { ...row.snack }])
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
    .input(DailyMenuCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRow] = await db
          .insert(dailyMenu)
          .values({
            ...input,
            day: new Date(input.day),
          })
          .returning();

        return newRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  createManyByMenuBook: os
    .route({ path: "/", method: "POST" })
    .input(z.object({ menuBookId: z.number(), day: z.string() }))
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const date = new Date(input.day);
          const menus = await tx
            .select()
            .from(menu)
            .innerJoin(menuMakananDetail, eq(menu.id, menuMakananDetail.menuId))
            .innerJoin(menuSnackDetail, eq(menu.id, menuSnackDetail.menuId))
            .where(
              and(
                eq(menu.menuBookId, input.menuBookId),
                eq(menu.menuOrder, calculateMenuOrder(date.getDate()))
              )
            );

          const menuGroup = Array.from(
            Map.groupBy(menus, (rows) => rows.menu.id),
            ([, group]) => ({
              menu: group[0].menu,
              makananDetailList: group.map((row) => row.menu_makanan_detail),
              snackDetailList: group.map((row) => row.menu_snack_detail),
            })
          );

          const newDailyMenu = await tx
            .insert(dailyMenu)
            .values(
              menuGroup.map((item) => ({
                day: date,
                menuId: item.menu.id,
              }))
            )
            .returning();
          const dailyMenuLookup = new Map(
            newDailyMenu.map((dm) => [dm.menuId, dm])
          );

          const dailyMenuMakananInput = menuGroup.flatMap((item) =>
            item.makananDetailList.map((detail) => ({
              dailyMenuId: dailyMenuLookup.get(item.menu.id)!.id,
              makananId: detail.makananId,
            }))
          );
          await tx.insert(dailyMenuMakananDetail).values(dailyMenuMakananInput);

          const dailyMenuSnackInput = menuGroup.flatMap((item) =>
            item.snackDetailList.map((detail) => ({
              dailyMenuId: dailyMenuLookup.get(item.menu.id)!.id,
              snackId: detail.snackId,
            }))
          );
          await tx.insert(dailyMenuSnackDetail).values(dailyMenuSnackInput);

          return newDailyMenu;
        });
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

export const dailyMenuDetailProcedure = {
  update: os
    .route({ path: "/", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ dailyMenuId: z.number() }),
        body: DailyMenuDetailSchema,
      })
    )
    .handler(async ({ input }) => {
      return await db.transaction(async (tx) => {
        await tx
          .delete(dailyMenuMakananDetail)
          .where(
            eq(dailyMenuMakananDetail.dailyMenuId, input.params.dailyMenuId)
          );

        await tx
          .delete(dailyMenuSnackDetail)
          .where(
            eq(dailyMenuSnackDetail.dailyMenuId, input.params.dailyMenuId)
          );

        const makananIdInput = input.body.makananIds.map((id) => ({
          makananId: id,
          dailyMenuId: input.params.dailyMenuId,
        }));
        if (makananIdInput.length > 0) {
          await tx
            .insert(dailyMenuMakananDetail)
            .values(makananIdInput)
            .onConflictDoNothing();
        }

        const snackIdInput = input.body.snackIds.map((id) => ({
          snackId: id,
          dailyMenuId: input.params.dailyMenuId,
        }));
        if (snackIdInput.length > 0) {
          await tx
            .insert(dailyMenuSnackDetail)
            .values(snackIdInput)
            .onConflictDoNothing();
        }

        return { message: "Menu harian berhasil diupdate" };
      });
    }),
};
