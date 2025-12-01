/** eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Suspense, useState } from "react";

import AppDialog from "@/components/app-dialog";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDialog } from "@/hooks/use-dialog";
import { capitalizeFirst } from "@/lib/utils";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

import DailyBahanMakananForm from "./bahan-makanan-form";

const BahanMakananTables = () => {
  return (
    <div className="flex flex-col gap-8">
      <BahanMakananTable category="basah" />
      <BahanMakananTable category="kering" />
    </div>
  );
};

interface BahanMakananTableProps {
  category: "kering" | "basah";
}

const BahanMakananTable = ({ category }: BahanMakananTableProps) => {
  const { dates } = useDateStore();
  const pemesananDate = dates["pemesananDate"];
  const dayString = pemesananDate.toLocaleDateString("en-CA");
  const { data: dailyBahanMakanan } = useSuspenseQuery(
    orpc.dailyBahanMakanan.getAll.queryOptions({
      input: {
        date: dayString,
        bahanMakananCategory: category,
      },
    })
  );

  const dialog = useAppDialog(`updateDailyBahanMakanan-${category}`);
  const [selectedItem, setSelectedItem] =
    useState<(typeof dailyBahanMakanan)[number]>();

  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );

  const columnHelper = createColumnHelper<(typeof dailyBahanMakanan)[number]>();
  const columns = [
    columnHelper.accessor("bahanMakanan.name", {
      id: "bahanMakananName",
      header: "Bahan makanan",
      cell: (info) => info.getValue(),
      size: 150,
    }),
    columnHelper.accessor("bahanMakanan.unit", {
      id: "bahanMakananUnit",
      header: "Satuan",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    ...treatmentClassList.map((tc) =>
      columnHelper.accessor(
        (row) =>
          row.quantities.find((item) => item.treatmentClass.id === tc.id),
        {
          id: `treatmentClass-${tc.code}`,
          header: tc.code,
          size: 50,
          cell: (info) => info.getValue()?.quantity ?? "",
        }
      )
    ),
    columnHelper.accessor((row) => row.quantities, {
      id: "totalQuantity",
      header: "I + II + III",
      cell: (info) => {
        const total = info
          .getValue()
          .reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        return total;
      },
      size: 50,
    }),
  ];

  const table = useReactTable({
    data: dailyBahanMakanan,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnOrder: [
        "bahanMakananName",
        "bahanMakananUnit",
        "treatmentClass-VIP",
        "treatmentClass-I",
        "treatmentClass-II",
        "treatmentClass-III",
        "totalQuantity",
      ],
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">
        Pemesanan Bahan Makanan {capitalizeFirst(category)}
      </h2>
      <div className="flex gap-2 justify-between items-end">
        <div className="flex flex-col gap-1 lg:w-1/3">
          <FieldLabel>Cari bahan makanan</FieldLabel>
          <Input
            value={
              (table
                .getColumn("bahanMakananName")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("bahanMakananName")
                ?.setFilterValue(e.target.value)
            }
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary/80 hover:bg-primary/70 hover:cursor-pointer"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedItem(row.original);
                    setTimeout(() => dialog.open(), 5);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-normal break-words"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AppDialog
        id={`updateDailyBahanMakanan-${category}`}
        title="Edit Bahan Makanan"
        description={selectedItem?.bahanMakanan.name}
      >
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <DailyBahanMakananForm
            initialData={selectedItem}
            pemesananDate={dayString}
            category={category}
          />
        </Suspense>
      </AppDialog>
    </div>
  );
};

export default BahanMakananTables;
