import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import {
  makanan,
  menu,
  menuBook,
  menuMakananDetail,
  menuSnackDetail,
  snack,
} from "@/db/schema";
import { MenuBookCreateSchema, MenuCreateSchema } from "@/schemas/menu";

import { handleORPCError } from "../utils";

export const menuProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(z.object({ menuBookId: z.number() }).optional())
    .handler(async ({ input }) => {
      try {
        const rows = await db
          .select()
          .from(menu)
          .innerJoin(menuMakananDetail, eq(menu.id, menuMakananDetail.menuId))
          .innerJoin(makanan, eq(menuMakananDetail.makananId, makanan.id))
          .innerJoin(menuSnackDetail, eq(menu.id, menuSnackDetail.menuId))
          .innerJoin(snack, eq(menuSnackDetail.snackId, snack.id))
          .where(
            input?.menuBookId
              ? eq(menu.menuBookId, input.menuBookId)
              : undefined
          );

        const result = Array.from(
          Map.groupBy(rows, (row) => row.menu.id),
          ([, group]) => ({
            menu: group[0].menu,
            makananList: Array.from(
              new Map(
                group.map((row) => [
                  row.menu_makanan_detail.makananId,
                  { ...row.makanan },
                ])
              ).values()
            ),
            snackList: Array.from(
              new Map(
                group.map((row) => [
                  row.menu_snack_detail.snackId,
                  { ...row.snack },
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
    .input(MenuCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [newMenu] = await tx
            .insert(menu)
            .values({
              name: input.name,
              menuOrder: input.menuOrder,
              menuPeriod: input.menuPeriod,
              menuBookId: input.menuBookId,
            })
            .returning();

          const menuMakananDetailInput = input.makananIds.map((id) => ({
            menuId: newMenu.id,
            makananId: id,
          }));
          const newMenuMakananDetail = await tx
            .insert(menuMakananDetail)
            .values(menuMakananDetailInput)
            .returning();

          const menuSnackDetailInput = input.snackIds.map((id) => ({
            menuId: newMenu.id,
            snackId: id,
          }));
          const newMenuSnackDetail = await tx
            .insert(menuSnackDetail)
            .values(menuSnackDetailInput)
            .returning();

          return {
            menu: newMenu,
            menuMakananDetail: newMenuMakananDetail,
            menuSnackDetail: newMenuSnackDetail,
          };
        });
      } catch (error) {
        console.log(error);
        handleORPCError(error);
      }
    }),

  update: os
    .route({ path: "/{id}", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: MenuCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          await tx
            .update(menu)
            .set({
              name: input.body.name,
              menuOrder: input.body.menuOrder,
              menuPeriod: input.body.menuPeriod,
            })
            .where(eq(menu.id, input.params.id));

          await tx
            .delete(menuMakananDetail)
            .where(eq(menuMakananDetail.menuId, input.params.id));

          await tx
            .delete(menuSnackDetail)
            .where(eq(menuSnackDetail.menuId, input.params.id));

          const menuMakananDetailInput = input.body.makananIds.map((id) => ({
            menuId: input.params.id,
            makananId: id,
          }));
          if (input.body.makananIds.length > 0) {
            await tx
              .insert(menuMakananDetail)
              .values(menuMakananDetailInput)
              .onConflictDoNothing();
          }

          const menuSnackDetailInput = input.body.snackIds.map((id) => ({
            menuId: input.params.id,
            snackId: id,
          }));
          if (input.body.snackIds.length > 0) {
            await tx
              .insert(menuSnackDetail)
              .values(menuSnackDetailInput)
              .onConflictDoNothing();
          }

          const updatedRows = await db
            .select()
            .from(menu)
            .innerJoin(menuMakananDetail, eq(menu.id, menuMakananDetail.menuId))
            .innerJoin(makanan, eq(menuMakananDetail.makananId, makanan.id))
            .innerJoin(menuSnackDetail, eq(menu.id, menuSnackDetail.menuId))
            .innerJoin(snack, eq(menuSnackDetail.snackId, snack.id))
            .where(eq(menu.id, input.params.id));

          const [result] = Array.from(
            Map.groupBy(updatedRows, (row) => row.menu.id),
            ([, group]) => ({
              menu: group[0].menu,
              makananList: Array.from(
                new Map(
                  group.map((row) => [
                    row.menu_makanan_detail.makananId,
                    { ...row.makanan },
                  ])
                ).values()
              ),
              snackList: Array.from(
                new Map(
                  group.map((row) => [
                    row.menu_snack_detail.snackId,
                    { ...row.snack },
                  ])
                ).values()
              ),
            })
          );

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
          .delete(menu)
          .where(eq(menu.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};

export const menuBookProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.menuBook.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(MenuBookCreateSchema)
    .handler(async ({ input }) => {
      try {
        const [newRow] = await db
          .insert(menuBook)
          .values({
            name: input.name,
          })
          .returning();

        return newRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  update: os
    .route({ path: "/", method: "PUT", inputStructure: "detailed" })
    .input(
      z.object({
        params: z.object({ id: z.number() }),
        body: MenuBookCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        const [updatedRow] = await db
          .update(menuBook)
          .set({
            name: input.body.name,
          })
          .where(eq(menuBook.id, input.params.id))
          .returning();

        return updatedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  delete: os
    .route({ path: "/", method: "DELETE" })
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const [deletedRow] = await db
          .delete(menuBook)
          .where(eq(menuBook.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
