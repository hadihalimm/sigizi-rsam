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
import Link from "next/link";
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
import { menuBookQuery } from "@/query/menu";
import { orpc } from "@/server/orpc";

import MenuBookForm from "./menu-book-form";

const MenuBookTable = () => {
  const { data: menuBookList } = useSuspenseQuery(
    orpc.menuBook.getAll.queryOptions()
  );

  const createDialog = useAppDialog("createMenuBook");
  const updateDialog = useAppDialog("updateMenuBook");
  const deleteDialog = useAppAlertDialog("deleteMenuBook");

  const [selectedItem, setSelectedItem] =
    useState<(typeof menuBookList)[number]>();

  const columnHelper = createColumnHelper<(typeof menuBookList)[number]>();
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
      cell: ({ row }) => (
        <div className="flex gap-x-2 lg:gap-x-6 items-center">
          <p>{row.original.name}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/menu-book/${row.original.id}/menu`}>
              Detail
            </Link>
          </Button>
        </div>
      ),
      size: 150,
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Terakhir di-update",
      cell: (info) =>
        new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "long",
        }).format(info.getValue()),
      size: 150,
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
      size: 80,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: menuBookList,
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

  const deleteMenuBook = menuBookQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari buku menu</FieldLabel>
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
          <span>Tambah buku menu</span>
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

      <AppDialog id="createMenuBook" title="Tambah buku menu">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <MenuBookForm />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateMenuBook" title="Update buku menu">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <MenuBookForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deleteMenuBook"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deleteMenuBook.mutateAsync({
            id: selectedItem.id,
          });
          toast.info("Buku menu berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default MenuBookTable;
