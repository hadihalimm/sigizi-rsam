"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

const BahanMakananTable = () => {
  const { dates } = useDateStore();
  const pemesananDate = dates["pemesananDate"];
  const { data: dailyBahanMakanan } = useSuspenseQuery(
    orpc.dailyBahanMakanan.getAll.queryOptions({
      input: {
        date: pemesananDate.toLocaleDateString("en-CA"),
      },
    })
  );
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
          row.quantities.find((item) => item.treatmentClass.id === tc.id)
            ?.quantity ?? 0,
        {
          id: `treatmentClass-${tc.code}`,
          header: tc.code,
          cell: (info) => info.getValue(),
          size: 50,
        }
      )
    ),
  ];

  const table = useReactTable({
    data: dailyBahanMakanan,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Daftar Pemesanan Bahan Makanan</h2>
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col flex-1 gap-1 w-1/2">
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
        {/*{dailyBahanMakanan.length === 0 && (
          <Button
            className="w-1/2 flex-1 h-auto whitespace-normal"
            onClick={async () =>
              generateDailyBahanMakanan.mutateAsync({
                date: pemesananDate.toLocaleDateString("en-CA"),
              })
            }
          >
            <span>Generate bahan makanan</span>
          </Button>
        )}*/}
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary/80 hover:bg-primary/70"
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
                <TableRow key={row.id}>
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
    </div>
  );
};

export default BahanMakananTable;
