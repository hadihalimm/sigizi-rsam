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
import { menuQuery } from "@/query/menu";
import { orpc } from "@/server/orpc";

import MenuForm from "./menu-form";

interface MenuTableProps {
  menuBookId: number;
}

const MenuTable = ({ menuBookId }: MenuTableProps) => {
  const { data: menuList } = useSuspenseQuery(
    orpc.menu.getAll.queryOptions({
      input: { menuBookId: menuBookId },
    })
  );
  const createDialog = useAppDialog("createMenu");
  const updateDialog = useAppDialog("updateMenu");
  const deleteDialog = useAppAlertDialog("deleteMenu");
  const [selectedItem, setSelectedItem] = useState<(typeof menuList)[number]>();

  const columnHelper = createColumnHelper<(typeof menuList)[number]>();
  const columns = [
    columnHelper.accessor("menu.name", {
      id: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("menu.menuOrder", {
      id: "menuOrder",
      header: "Urutan",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("menu.menuPeriod", {
      id: "menuPeriod",
      header: "Waktu",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor((row) => row, {
      id: "makananSnackList",
      header: "Daftar makanan & snack",
      cell: ({ row }) => (
        <div className="grid grid-cols-2 auto-rows-auto gap-2">
          <div className="flex flex-col gap-y-2">
            <p>Daftar makanan</p>
            <ul className="list-disc">
              {row.original.makananList.map((makanan) => (
                <li key={makanan.id}>{makanan.name}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-y-2">
            <p>Daftar snack</p>
            <ul className="list-disc">
              {row.original.snackList.map((snack) => (
                <li key={snack.id}>{snack.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
      size: 250,
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
    data: menuList,
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

  const deleteMenu = menuQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari menu</FieldLabel>
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
          <span>Tambah menu</span>
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
                      className="whitespace-normal"
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

      <AppDialog id="createMenu" title="Tambah Menu">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <MenuForm menuBookId={menuBookId} />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateMenu" title="Update menu">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <MenuForm initialData={selectedItem} menuBookId={menuBookId} />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateMenu" title="Update menu">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <MenuForm initialData={selectedItem} menuBookId={menuBookId} />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deleteMenu"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deleteMenu.mutateAsync({
            id: selectedItem.menu.id,
          });
          toast.info("Menu berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default MenuTable;
