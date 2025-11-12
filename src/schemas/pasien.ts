import z from "zod";

export const PasienCreateSchema = z.object({
  medicalRecordNumber: z
    .string()
    .min(1, { message: "Nomor MR tidak boleh kosong" }),
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  dateOfBirth: z.date({ message: "Tanggal lahir tidak boleh kosong" }),
  alergiIds: z.array(z.number()),
});
