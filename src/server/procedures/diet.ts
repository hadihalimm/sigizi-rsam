import { os } from "@orpc/server";

import db from "@/db";
import { diet } from "@/db/schema";
import { DietCreateSchema } from "@/schemas/diet";

import { orpc } from "../orpc";
import { handleORPCError } from "../utils";

export const dietProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.diet.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
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
};
