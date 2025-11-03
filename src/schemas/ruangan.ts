import z from "zod";

export const BangsalCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  simrsCode: z.string().min(1, { message: "Kode SIMRS tidak boleh kosong" }),
});

export const RuanganCreateSchema = z.object({
  code: z.string().min(1, { message: "Kode tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  treatmentClass: z
    .string()
    .min(1, { message: "Kelas rawatan tidak boleh kosong" }),
  bangsalId: z.number().positive({ message: "Bangsal ID tidak boleh kosong" }),
  simrsCode: z.string().min(1, { message: "Kode SIMRS tidak boleh kosong" }),
});
