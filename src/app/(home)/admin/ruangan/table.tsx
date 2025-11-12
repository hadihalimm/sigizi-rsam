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
import React, { Suspense, useState } from "react";
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
import { bangsalQuery, ruanganQuery } from "@/query/ruangan";
import { orpc } from "@/server/orpc";

import BangsalForm from "./bangsal-form";
import RuanganForm from "./ruangan-form";

const RuanganTable = () => {
  const { data } = useSuspenseQuery(
    orpc.bangsal.getAllWithRuangan.queryOptions()
  );
  const createBangsalDialog = useAppDialog("createBangsal");
  const updateBangsalDialog = useAppDialog("updateBangsal");
  const deleteBangsalDialog = useAppAlertDialog("deleteBangsal");
  const createRuanganDialog = useAppDialog("createRuangan");
  const updateRuanganDialog = useAppDialog("updateRuangan");
  const deleteRuanganDialog = useAppAlertDialog("deleteRuangan");

  const [selectedBangsal, setSelectedBangsal] =
    useState<(typeof data)[number]["bangsal"]>();
  const [selectedRuangan, setSelectedRuangan] =
    useState<(typeof data)[number]["ruangan"]>();

  const columnHelper = createColumnHelper<(typeof data)[number]>();
  const columns = [
    columnHelper.accessor("bangsal.name", {
      id: "bangsal",
      header: "Nama bangsal",
      cell: (info) => {
        const currentBangsalId = info.row.original.bangsal.id;
        const rowIndex = info.row.index;
        const isFirstOccurence =
          rowIndex === 0 || data[rowIndex - 1].bangsal.id !== currentBangsalId;
        if (!isFirstOccurence) return null;

        let count = 1;
        for (let i = rowIndex + 1; i < data.length; i++) {
          if (data[i].bangsal.id === currentBangsalId) {
            count++;
          } else break;
        }
        return (
          <TableCell rowSpan={count} className="align-top">
            <div className="flex items-center gap-2">
              <DropdownRowAction
                align="start"
                actions={[
                  {
                    label: "Tambah ruangan",
                    icon: Plus,
                    onClick: () => {
                      setSelectedBangsal(info.row.original.bangsal);
                      createRuanganDialog.open();
                    },
                  },
                  {
                    label: "Update",
                    onClick: () => {
                      setSelectedBangsal(info.row.original.bangsal);
                      updateBangsalDialog.open();
                    },
                  },
                  {
                    label: "Delete",
                    onClick: () => {
                      setSelectedBangsal(info.row.original.bangsal);
                      deleteBangsalDialog.open();
                    },
                  },
                ]}
              />
              <p>{info.getValue()}</p>
            </div>
          </TableCell>
        );
      },
      size: 100,
    }),
    columnHelper.accessor("ruangan.name", {
      id: "ruangan",
      header: "Daftar ruangan",
      cell: (info) => {
        if (!info.getValue()) return null;
        return (
          <div className="flex items-center gap-2">
            <DropdownRowAction
              align="start"
              actions={[
                {
                  label: "Update",
                  onClick: () => {
                    setSelectedRuangan(info.row.original.ruangan);
                    updateRuanganDialog.open();
                  },
                },
                {
                  label: "Delete",
                  onClick: () => {
                    setSelectedRuangan(info.row.original.ruangan);
                    deleteRuanganDialog.open();
                  },
                },
              ]}
            />
            <p>{info.getValue()}</p>
          </div>
        );
      },
      size: 100,
    }),
    columnHelper.accessor("treatment_class.code", {
      id: "treatmentClass",
      header: "Kelas rawatan",
      cell: (info) => info.getValue(),
      size: 50,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
    },
  });

  const deleteBangsal = bangsalQuery.useDelete();
  const deleteRuangan = ruanganQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari ruangan</FieldLabel>
          <Input
            value={
              (table.getColumn("bangsal")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("bangsal")?.setFilterValue(e.target.value)
            }
          />
        </div>
        <Button
          className="w-1/2 h-auto whitespace-normal"
          onClick={() => createBangsalDialog.open()}
        >
          <Plus />
          <span>Tambah Bangsal</span>
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
                    <React.Fragment key={cell.id}>
                      {cell.column.columnDef.id === "bangsal" ? (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : (
                        <TableCell className="whitespace-normal break-words">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )}
                    </React.Fragment>
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

      <AppDialog id="createBangsal" title="Tambah Bangsal">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <BangsalForm />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateBangsal" title="Update Bangsal">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <BangsalForm initialData={selectedBangsal} />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deleteBangsal"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedBangsal) return;
          await deleteBangsal.mutateAsync({
            id: selectedBangsal.id,
          });
          toast.info("Bangsal berhasil dihapus.");
        }}
      />

      <AppDialog
        id="createRuangan"
        title="Tambah Ruangan"
        description={`Berada di bawah bangsal ${selectedBangsal?.name}`}
      >
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <RuanganForm bangsalId={selectedBangsal?.id ?? 0} />
        </Suspense>
      </AppDialog>
      <AppDialog id="updateRuangan" title="Update Ruangan">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <RuanganForm
            initialData={selectedRuangan!}
            bangsalId={selectedBangsal?.id ?? 0}
          />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deleteRuangan"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedRuangan) return;
          await deleteRuangan.mutateAsync({
            id: selectedRuangan.id,
          });
          toast.info("Ruangan berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default RuanganTable;
