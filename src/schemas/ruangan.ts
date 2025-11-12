import z from "zod";

export const BangsalCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  simrsCode: z.string().optional(),
});

export const RuanganCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  treatmentClassId: z
    .number()
    .positive({ message: "Kelas rawatan tidak boleh kosong" }),
  bangsalId: z.number().positive({ message: "Bangsal ID tidak boleh kosong" }),
  simrsCode: z.string().optional(),
});

export const TreatmentClassCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
});
