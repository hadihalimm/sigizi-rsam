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
import { alergiQuery } from "@/query/alergi";
import { orpc } from "@/server/orpc";

import AlergiForm from "./form";

const AlergiTable = () => {
  const { data: alergiList } = useSuspenseQuery(
    orpc.alergi.getAll.queryOptions()
  );

  const createDialog = useAppDialog("createAlergi");
  const updateDialog = useAppDialog("updateAlergi");
  const deleteDialog = useAppAlertDialog("deleteAlergi");
  const [selectedItem, setSelectedItem] =
    useState<(typeof alergiList)[number]>();

  const columnHelper = createColumnHelper<(typeof alergiList)[number]>();
  const columns = [
    columnHelper.accessor("code", {
      id: "code",
      header: "Kode",
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Nama",
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
      size: 50,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data: alergiList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
    },
  });

  const deleteAlergi = alergiQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari alergi</FieldLabel>
          <Input
            value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("code")?.setFilterValue(e.target.value)
            }
          />
        </div>
        <Button
          className="w-1/2 h-auto whitespace-normal"
          onClick={() => createDialog.open()}
        >
          <Plus />
          <span>Tambah alergi</span>
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

      <AppDialog id="createAlergi" title="Tambah Diet">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <AlergiForm />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateAlergi" title="Update Diet">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <AlergiForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>

      <AppAlertDialog
        id="deleteAlergi"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deleteAlergi.mutateAsync({
            id: selectedItem.id,
          });
          toast.info("Alergi berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default AlergiTable;
