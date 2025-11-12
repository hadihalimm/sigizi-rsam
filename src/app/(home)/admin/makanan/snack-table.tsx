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
import { Suspense, useState } from "react";
import { toast } from "sonner";

import AppAlertDialog from "@/components/app-alert-dialog";
import AppDialog from "@/components/app-dialog";
import { DropdownRowAction } from "@/components/dropdown-row-action";
import TablePagination from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
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
import { useAppAlertDialog, useAppDialog } from "@/hooks/use-dialog";
import { snackQuery } from "@/query/snack";
import { orpc } from "@/server/orpc";

import SnackForm from "./snack-form";

const SnackTable = () => {
  const { data: snackList } = useSuspenseQuery(
    orpc.snack.getAll.queryOptions()
  );

  const createDialog = useAppDialog("createSnack");
  const updateDialog = useAppDialog("updateSnack");
  const deleteDialog = useAppAlertDialog("deleteSnack");
  const [selectedItem, setSelectedItem] =
    useState<(typeof snackList)[number]>();

  const columnHelper = createColumnHelper<(typeof snackList)[number]>();
  const columns = [
    columnHelper.accessor("snack.name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("makananTypeList", {
      id: "makananTypeList",
      header: "Jenis snack",
      cell: (info) =>
        info
          .getValue()
          .map((mt) => mt.code)
          .join(", "),
      size: 100,
    }),
    columnHelper.accessor("dietList", {
      id: "dietList",
      header: "Diet",
      cell: (info) =>
        info
          .getValue()
          .map((diet) => diet.code)
          .join(", "),
      size: 100,
    }),
    columnHelper.accessor("snackResepDetail", {
      id: "snackResepDetail",
      header: "Resep",
      cell: (info) => (
        <ol>
          {info.getValue().map((bahanMakanan) => (
            <li key={bahanMakanan.id}>
              {bahanMakanan.name} {bahanMakanan.quantity} {bahanMakanan.unit}
            </li>
          ))}
        </ol>
      ),
      size: 120,
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
    data: snackList,
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

  const deleteSnack = snackQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari snack</FieldLabel>
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
          <span>Tambah snack</span>
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

      <AppDialog id="createSnack" title="Tambah Snack">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <SnackForm />
        </Suspense>
      </AppDialog>

      <AppDialog id="updateSnack" title="Update Snack">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <SnackForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>

      <AppAlertDialog
        id="deleteSnack"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deleteSnack.mutateAsync({
            id: selectedItem.snack.id,
          });
          toast.info("Snack berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default SnackTable;
