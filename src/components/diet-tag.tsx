{
  /* eslint-disable @next/next/no-img-element */
}
import { DailyPermintaanMakananDetail } from "@/types/db";

interface DietTagsProps {
  data: DailyPermintaanMakananDetail[];
}

export function DietTags({ data }: DietTagsProps) {
  return (
    <section className="flex flex-col">
      {data.map((item) => (
        <div
          key={item.dailyPermintaanMakanan.id}
          className="flex flex-col w-[384px] gap-4 p-2 border border-black"
        >
          <div className="flex justify-between items-center mx-4">
            <img
              src="/sumbar-logo-bnw.png"
              alt="Logo Kota Bukittinggi"
              width="30"
            />
            <div className="flex flex-col text-center">
              <span className="font-semibold">Etiket Diet</span>
              <span className="font-semibold">INSTALASI GIZI</span>
            </div>
            <img src="/rsam-logo-bnw.png" alt="Logo RSAM" width="30" />
          </div>

          <table>
            <tbody>
              <tr className="align-top">
                <th className="font-normal text-start w-36">Nama</th>
                <td>:</td>
                <td className="text-xl font-bold">{item.pasien.name}</td>
              </tr>

              <tr>
                <th className="font-normal text-start">Tanggal lahir</th>
                <td>:</td>
                <td>
                  {item.pasien.dateOfBirth &&
                    Intl.DateTimeFormat("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(item.pasien.dateOfBirth)}
                </td>
              </tr>

              <tr>
                <th className="font-normal text-start">No. RM</th>
                <td>:</td>
                <td>{item.pasien.medicalRecordNumber}</td>
              </tr>

              <tr>
                <th className="font-normal text-start">Ruangan/Bangsal</th>
                <td>:</td>
                <td>
                  {item.ruangan.name}/{item.bangsal.name}
                </td>
              </tr>

              <tr>
                <th className="font-normal text-start">Diet</th>
                <td>:</td>
                <td className="text-xl font-bold">
                  <span>{item.makananType.code}</span>
                  <span> </span>
                  <span>
                    {item.dailyPermintaanMakananDietList
                      .map((diet) => diet.code)
                      .join("")}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-center">
            <div className="text-base font-semibold">
              <p>DEMI KEAMANAN MAKANAN,</p>
              <p>MOHON UNTUK SEGERA DIKONSUMSI</p>
              <p>TERIMA KASIH</p>
            </div>
            <div className="mr-4">
              <img src="/halal.png" alt="Logo Halal" width="30" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DietTags;
