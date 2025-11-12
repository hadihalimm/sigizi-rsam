"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

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

const DietRekap = () => {
  const { todayDate } = useDateStore();
  const { data } = useSuspenseQuery(
    orpc.dailyPermintaanMakanan.getAll.queryOptions({
      input: {
        date: todayDate!.toLocaleDateString("en-CA"),
      },
    })
  );

  const record: Record<string, number> = {};
  data.forEach((item) => {
    item.dailyPermintaanMakananDietList.sort((a, b) => a.id - b.id);
    const key = item.dailyPermintaanMakananDietList
      .map((diet) => diet.code)
      .join(" ");
    record[key] = (record[key] ?? 0) + 1;
  });

  return (
    <div className="flex flex-col border rounded-md p-4 gap-6">
      <h2 className="font-medium bg-primary/80 rounded-md w-fit px-2 py-1">
        Rekap Diet
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Diet</TableHead>
            <TableHead>Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(record).map(([key, count]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DietRekap;
