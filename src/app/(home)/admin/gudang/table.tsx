"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Funnel } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import AppDialog from "@/components/app-dialog";
import { DropdownRowAction } from "@/components/dropdown-row-action";
import TablePagination from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { orpc } from "@/server/orpc";

import StockDetail from "./detail";
import StockUpdateForm from "./form";

const StockBahanMakananTable = () => {
  const { data: stock } = useSuspenseQuery(
    orpc.stockBahanMakanan.getAll.queryOptions()
  );
  const createDialog = useAppDialog("createStockBahanMakananHistory");
  const detailDialog = useAppDialog("detailStockBahanMakananHistory");
  const [selectedItem, setSelectedItem] = useState<(typeof stock)[number]>();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<(typeof stock)[number]>();
    return [
      columnHelper.accessor("bahan_makanan.name", {
        id: "name",
        header: "Nama",
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor("bahan_makanan.category", {
        id: "category",
        header: (info) => {
          const column = info.column;
          return (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" size="icon-sm">
                    <div className="transition-transform duration-300 hover:scale-125">
                      <Funnel className="text-primary-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuRadioGroup
                    value={(column.getFilterValue() as string) ?? ""}
                    onValueChange={(value) => column.setFilterValue(value)}
                  >
                    <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="kering">
                      Kering
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="basah">
                      Basah
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <p>Kategori</p>
            </div>
          );
        },
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor("bahan_makanan.unit", {
        id: "unit",
        header: "Satuan",
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor("stock_bahan_makanan.quantity", {
        id: "quantity",
        header: "Quantity",
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <DropdownRowAction
            actions={[
              {
                label: "Detail",
                onClick: () => {
                  setSelectedItem(row.original);
                  setTimeout(() => detailDialog.open(), 0);
                },
              },
              {
                label: "Update",
                onClick: () => {
                  setSelectedItem(row.original);
                  setTimeout(() => createDialog.open(), 0);
                },
              },
            ]}
          />
        ),
        size: 50,
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data: stock,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari bahan makanan</FieldLabel>
          <Input
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
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
                className="bg-primary/80 hover:bg-primary/70"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                      className=""
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

      <TablePagination
        table={table}
        maxPagesToShow={5}
        sidePages={1}
        className="mt-2"
      />

      <AppDialog id="createStockBahanMakananHistory" title="Update Stok">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <StockUpdateForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>

      <AppDialog
        id="detailStockBahanMakananHistory"
        title="Detail Stok"
        description={selectedItem?.bahan_makanan.name}
        className="lg:w-1/3"
      >
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <StockDetail
            bahanMakananStockId={selectedItem?.stock_bahan_makanan.id ?? 0}
          />
        </Suspense>
      </AppDialog>
    </div>
  );
};

export default StockBahanMakananTable;
