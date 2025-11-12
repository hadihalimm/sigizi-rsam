"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import AppAlertDialog from "@/components/app-alert-dialog";
import AppDialog from "@/components/app-dialog";
import { DropdownRowAction } from "@/components/dropdown-row-action";
import TablePagination from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
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
import { useAppAlertDialog, useAppDialog } from "@/hooks/use-dialog";
import { bahanMakananQuery } from "@/query/bahan-makanan";
import { orpc } from "@/server/orpc";
import { BahanMakanan } from "@/types/db";

import BahanMakananForm from "./form";

const BahanMakananTable = () => {
  const { data: bahanMakananList } = useSuspenseQuery(
    orpc.bahanMakanan.getAll.queryOptions()
  );

  const createDialog = useAppDialog("createBahanMakanan");
  const updateDialog = useAppDialog("updateBahanMakanan");
  const deleteDialog = useAppAlertDialog("deleteBahanMakanan");
  const [selectedItem, setSelectedItem] = useState<BahanMakanan>();

  const columnHelper = createColumnHelper<BahanMakanan>();
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      size: 120,
    }),
    columnHelper.accessor("category", {
      id: "category",
      header: "Kategori",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("unit", {
      id: "unit",
      header: "Satuan",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("standard", {
      id: "standard",
      header: "Standar",
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
              label: "Update",
              onClick: () => {
                setSelectedItem(row.original);
                updateDialog.open();
              },
            },
            {
              label: "Delete",
              onClick: () => {
                setSelectedItem(row.original);
                deleteDialog.open();
              },
            },
          ]}
        />
      ),
      size: 70,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: bahanMakananList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      pagination,
      columnFilters,
    },
  });

  const deleteBahanMakanan = bahanMakananQuery.useDelete();

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
        <Button
          className="w-1/2 h-auto whitespace-normal"
          onClick={() => createDialog.open()}
        >
          <Plus />
          Tambah bahan makanan
        </Button>
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

      <AppDialog id="createBahanMakanan" title="Tambah Bahan Makanan">
        <BahanMakananForm />
      </AppDialog>
      <AppDialog id="updateBahanMakanan" title="Edit Bahan Makanan">
        <BahanMakananForm initialData={selectedItem} />
      </AppDialog>
      <AppAlertDialog
        id="deleteBahanMakanan"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deleteBahanMakanan.mutateAsync({
            id: selectedItem.id,
          });
          toast.info("Bahan makanan berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default BahanMakananTable;
