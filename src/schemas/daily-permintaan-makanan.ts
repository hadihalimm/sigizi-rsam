import z from "zod";

export const DailyPermintaanMakananCreateSchema = z.object({
  day: z.string({ message: "Tanggal tidak boleh kosong" }),
  pasienId: z.number().nonnegative({ message: "Pasien ID tidak boleh kosong" }),
  ruanganId: z.number().positive({ message: "Ruangan ID tidak boleh kosong" }),
  makananTypeId: z
    .number()
    .positive({ message: "Jenis Makanan ID tidak boleh kosong" }),
  isTerlambat: z.boolean(),
  dietIds: z.array(
    z.number().positive({ message: "Diet ID tidak boleh kosong" })
  ),
  note: z.string(),
  pendampingCount: z.number(),
});
