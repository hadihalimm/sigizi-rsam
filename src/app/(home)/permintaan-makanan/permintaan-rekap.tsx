"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

const PermintaanRekap = () => {
  const { dates } = useDateStore();
  const permintaanDate = dates["permintaanDate"];
  const { data } = useSuspenseQuery(
    orpc.dailyPermintaanMakanan.getAll.queryOptions({
      input: {
        date: permintaanDate.toLocaleDateString("en-CA"),
      },
    })
  );
  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );

  let totalCount = 0;
  let vipCount = 0;
  let mcTssCount = 0;
  const matrix: Record<string, Record<string, number>> = {};
  const makananTypeTotals: Record<string, number> = {};
  treatmentClassList.forEach((tc) => {
    matrix[tc.code] = {};
    makananTypeList.forEach((mt) => {
      matrix[tc.code][mt.code] = 0;
      makananTypeTotals[mt.code] = 0;
    });
  });
  data.forEach((item) => {
    const tcCode = item.treatmentClass.code;
    const mtCode = item.makananType.code;
    matrix[tcCode][mtCode] += 1;
    makananTypeTotals[mtCode] += 1;

    if (
      mtCode.toLowerCase().includes("ml") ||
      mtCode.toLowerCase().includes("tss")
    ) {
      mcTssCount++;
    }
    if (tcCode.toLowerCase().includes("vip")) {
      vipCount++;
    } else {
      totalCount++;
    }
  });

  return (
    <div className="flex flex-col border rounded-md p-4 gap-6">
      <h2 className="font-medium bg-primary/80 rounded-md w-fit px-2 py-1">
        Rekap Permintaan Makanan
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-32 lg:w-48">
              <div className="flex flex-col">
                <p className="text-end">Jenis makanan</p>
                <Separator />
                <p>Kelas rawatan</p>
              </div>
            </TableHead>
            {makananTypeList.map((mt) => (
              <TableHead key={mt.code}>{mt.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatmentClassList.map((tc) => (
            <TableRow key={tc.code}>
              <TableCell>{tc.name}</TableCell>
              {makananTypeList.map((mt) => (
                <TableCell key={mt.code}>
                  {matrix[tc.code][mt.code] || ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            {makananTypeList.map((mt) => (
              <TableCell key={mt.code}>
                {makananTypeTotals[mt.code] || ""}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex">
          <p className="w-1/2">Jumlah VIP : </p>
          <p className="w-4">:</p>
          <p className="">{vipCount}</p>
        </div>
        <div className="flex">
          <p className="w-1/2">Jumlah I + II + III : </p>
          <p className="w-4">:</p>
          <p className="">{totalCount}</p>
        </div>
        <div className="flex">
          <p className="w-1/2">Jumlah ML + TSS : </p>
          <p className="w-4">:</p>
          <p className="">{mcTssCount}</p>
        </div>
      </div>
    </div>
  );
};

export default PermintaanRekap;
