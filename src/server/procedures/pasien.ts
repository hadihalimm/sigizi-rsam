import { os } from "@orpc/server";
import { and, eq, gt, ilike, inArray, or } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { alergi, pasien, pasienAlergi } from "@/db/schema";
import { PasienCreateSchema } from "@/schemas/pasien";
import { PasienAlergi } from "@/types/db";

import { handleORPCError } from "../utils";

export const pasienProcedure = {
  getAll: os
    .route({ path: "/", method: "GET" })
    .input(
      z.object({
        cursor: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const limit = 50;
        const pasienIds = await db
          .select({ id: pasien.id })
          .from(pasien)
          .where(
            and(
              input.cursor ? gt(pasien.id, input.cursor) : undefined,
              input.search
                ? or(
                    ilike(pasien.name, `%${input.search}%`),
                    ilike(pasien.medicalRecordNumber, `%${input.search}%`)
                  )
                : undefined
            )
          )
          .orderBy(pasien.id)
          .limit(limit);

        if (pasienIds.length === 0) {
          return { pasienList: [], nextCursor: undefined };
        }

        const rows = await db
          .select()
          .from(pasien)
          .leftJoin(pasienAlergi, eq(pasien.id, pasienAlergi.pasienId))
          .leftJoin(alergi, eq(pasienAlergi.alergiId, alergi.id))
          .where(
            inArray(
              pasien.id,
              pasienIds.map((pasien) => pasien.id)
            )
          )
          .orderBy(pasien.id);
        const pasienList = Array.from(
          Map.groupBy(rows, (row) => row.pasien.id),
          ([, group]) => ({
            pasien: group[0].pasien,
            alergi: group.filter((r) => r.alergi).map((r) => r.alergi),
          })
        );

        const nextCursor =
          pasienIds.length === limit
            ? pasienIds[pasienIds.length - 1].id
            : undefined;
        return { pasienList, nextCursor };
      } catch (error) {
        handleORPCError(error);
      }
    }),

  create: os
    .route({ path: "/", method: "POST" })
    .input(PasienCreateSchema)
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [newPasien] = await tx
            .insert(pasien)
            .values({
              name: input.name,
              medicalRecordNumber: input.medicalRecordNumber,
              dateOfBirth: input.dateOfBirth,
            })
            .returning();

          const pasienAlergiInput = input.alergiIds.map((id) => ({
            pasienId: newPasien.id,
            alergiId: id,
          }));
          let newPasienAlergi: PasienAlergi[] = [];
          if (pasienAlergiInput.length > 0) {
            newPasienAlergi = await tx
              .insert(pasienAlergi)
              .values(pasienAlergiInput)
              .returning();
          }

          return {
            pasien: newPasien,
            pasienAlergi: newPasienAlergi,
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
        body: PasienCreateSchema,
      })
    )
    .handler(async ({ input }) => {
      try {
        return await db.transaction(async (tx) => {
          const [updatedPasien] = await tx
            .update(pasien)
            .set({
              medicalRecordNumber: input.body.medicalRecordNumber,
              name: input.body.name,
              dateOfBirth: input.body.dateOfBirth,
            })
            .where(eq(pasien.id, input.params.id))
            .returning();

          await tx
            .delete(pasienAlergi)
            .where(eq(pasienAlergi.pasienId, input.params.id));

          const pasienAlergiInput = input.body.alergiIds.map((id) => ({
            pasienId: input.params.id,
            alergiId: id,
          }));
          let updatedPasienAlergi: PasienAlergi[] = [];
          if (pasienAlergiInput.length > 0) {
            updatedPasienAlergi = await tx
              .insert(pasienAlergi)
              .values(pasienAlergiInput)
              .onConflictDoNothing()
              .returning();
          }

          return {
            pasien: updatedPasien,
            pasienAlergi: updatedPasienAlergi,
          };
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
          .delete(pasien)
          .where(eq(pasien.id, input.id))
          .returning();

        return deletedRow;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  findByMedicalRecordNumber: os
    .route({ path: "/{id}", method: "GET" })
    .input(z.object({ medicalRecordNumber: z.string() }))
    .handler(async ({ input }) => {
      try {
        const row = await db.query.pasien.findFirst({
          where: eq(pasien.medicalRecordNumber, input.medicalRecordNumber),
        });

        return row;
      } catch (error) {
        handleORPCError(error);
      }
    }),

  findFromSimrs: os
    .route({ path: "/{mrn}", method: "GET" })
    .input(z.object({ medicalRecordNumber: z.string() }))
    .handler(async ({ input }) => {
      try {
        const response = await fetch(
          `${process.env.SIMRS_URL}/pasien/kunjungan/${input.medicalRecordNumber}`,
          {
            headers: {
              "X-Username": process.env.SIMRS_USERNAME ?? "",
              "X-Password": process.env.SIMRS_PASSWORD ?? "",
            },
          }
        );
        const result = (await response.json()) as {
          metadata: { code: number; message: string };
          response: { nomr: string; nama: string; tgl_lahir: string };
        };
        if (result.metadata.code === 400) return undefined;

        return result.response;
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
