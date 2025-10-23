import { os } from "@orpc/server";

import db from "@/db";
import { alergi } from "@/db/schema";
import { AlergiCreateSchema } from "@/schemas/alergi";

import { handleORPCError } from "../utils";

export const alergiProcedure = {
  getAll: os.route({ path: "/", method: "GET" }).handler(async () => {
    try {
      const rows = await db.query.alergi.findMany();

      return rows;
    } catch (error) {
      handleORPCError(error);
    }
  }),

  create: os
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
};
