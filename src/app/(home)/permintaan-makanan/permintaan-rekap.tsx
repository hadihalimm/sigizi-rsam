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
  const { todayDate } = useDateStore();
  const { data } = useSuspenseQuery(
    orpc.dailyPermintaanMakanan.getAll.queryOptions({
      input: {
        date: todayDate!.toLocaleDateString("en-CA"),
      },
    })
  );
  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );

  const matrix: Record<string, Record<string, number>> = {};
  treatmentClassList.forEach((tc) => {
    matrix[tc.code] = {};
    makananTypeList.forEach((mt) => {
      matrix[tc.code][mt.code] = 0;
    });
  });
  data.forEach((item) => {
    const tcCode = item.treatmentClass.code;
    const mtCode = item.makananType.code;
    matrix[tcCode][mtCode] += 1;
  });

  return (
    <div className="flex flex-col h-fit border rounded-md p-4 gap-6">
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
        </TableBody>
      </Table>
    </div>
  );
};

export default PermintaanRekap;
