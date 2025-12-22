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
import DatePicker from "@/components/ui/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { dailyPermintaanMakananQuery } from "@/query/daily-permintaan-makanan";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

import PermintaanMakananForm from "./permintaan-form";

const PermintaanMakananTable = () => {
  const { dates, setDate } = useDateStore();
  const permintaanDate = dates["permintaanDate"];

  const [currentBangsal, setCurrentBangsal] = useState<string>("all");
  const { data: bangsalList } = useSuspenseQuery(
    orpc.bangsal.getAll.queryOptions()
  );
  const { data } = useSuspenseQuery(
    orpc.dailyPermintaanMakanan.getAll.queryOptions({
      input: {
        date: permintaanDate.toLocaleDateString("en-CA"),
        bangsalId:
          currentBangsal !== "all" ? Number(currentBangsal) : undefined,
      },
    })
  );

  const createDialog = useAppDialog("createPermintaanMakanan");
  const updateDialog = useAppDialog("updatePermintaanMakanan");
  const deleteDialog = useAppAlertDialog("deletePermintaanMakanan");
  const [selectedItem, setSelectedItem] = useState<(typeof data)[number]>();

  const columnHelper = createColumnHelper<(typeof data)[number]>();
  const columns = [
    columnHelper.accessor("pasien.medicalRecordNumber", {
      id: "pasienMrn",
      header: "No. MR",
      cell: (info) => info.getValue(),
      size: 70,
    }),
    columnHelper.accessor("pasien.name", {
      id: "pasienName",
      header: "Nama",
      cell: (info) => info.getValue(),
      size: 125,
    }),
    columnHelper.accessor("ruangan.name", {
      id: "ruanganName",
      header: "Ruangan",
      cell: (info) => info.getValue(),
      size: 80,
    }),
    columnHelper.accessor("makananType.code", {
      id: "makananType",
      header: "Jenis makanan",
      cell: (info) => info.getValue(),
      size: 85,
    }),
    columnHelper.accessor("dailyPermintaanMakananDietList", {
      id: "dietList",
      header: "Diet",
      cell: (info) =>
        info
          .getValue()
          .map((diet) => diet.code)
          .join(", "),
      size: 80,
    }),
    columnHelper.accessor("dailyPermintaanMakanan.note", {
      id: "note",
      header: "Catatan",
      cell: (info) => info.getValue(),
      size: 80,
    }),
    columnHelper.accessor("dailyPermintaanMakanan.updatedAt", {
      id: "updatedAt",
      header: "Terakhir di-update",
      cell: (info) =>
        new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "medium",
        }).format(info.getValue()),
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
      size: 60,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const mrn = row.original.pasien.medicalRecordNumber.toLowerCase() ?? "";
      const name = row.original.pasien.name.toLowerCase() ?? "";
      return name.includes(search) || mrn.includes(search);
    },
  });
  const deletePermintaanMakanan = dailyPermintaanMakananQuery.useDelete();
  const copyFromYesterday = dailyPermintaanMakananQuery.useCopyFromYesterday();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 lg:w-1/2">
        <Field>
          <FieldLabel>Tanggal</FieldLabel>
          <DatePicker
            value={permintaanDate}
            onValueChange={(value) => setDate("permintaanDate", value!)}
            className="w-1/2"
          />
        </Field>
        <Field>
          <FieldLabel>Bangsal</FieldLabel>
          <Select
            value={currentBangsal}
            onValueChange={(value) => setCurrentBangsal(value)}
          >
            <SelectTrigger className="w-1/2 hover:bg-primary hover:text-primary-foreground">
              <SelectValue placeholder="Pilih bangsal..." />
              <SelectContent>
                <SelectItem value={"all"}>All</SelectItem>
                {bangsalList.map((bangsal) => (
                  <SelectItem key={bangsal.id} value={bangsal.id.toString()}>
                    {bangsal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectTrigger>
          </Select>
        </Field>
      </div>
      {data.length === 0 && currentBangsal === "all" && (
        <AppAlertDialog
          id="copyPermintaan"
          title="Copy permintaan makanan kemarin"
          description="Semua data permintaan hari kemarin akan di-copy ke hari ini."
          trigger={<Button className="w-fit">Copy permintaan kemarin</Button>}
          actionClassName="bg-primary hover:bg-primary/90"
          onAction={async () => {
            await copyFromYesterday.mutateAsync({
              date: permintaanDate.toLocaleDateString("en-CA"),
            });
          }}
        />
      )}
      <div className="flex gap-x-2 mt-4 items-end">
        <Field className="w-1/2">
          <FieldLabel>Cari permintaan makanan</FieldLabel>
          <Input
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            placeholder="Ketik MR atau nama pasien..."
            className="text-xs"
          />
        </Field>
        <div className="w-1/2 flex-1">
          <Button
            className="w-full h-auto whitespace-normal"
            onClick={() => createDialog.open()}
          >
            <Plus />
            <span>Tambah permintaan</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary/80 hover:bg-primary/70 h-12"
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

      <AppDialog id="createPermintaanMakanan" title="Tambah permintaan makanan">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <PermintaanMakananForm />
        </Suspense>
      </AppDialog>

      <AppDialog id="updatePermintaanMakanan" title="Update permintaan makanan">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <PermintaanMakananForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deletePermintaanMakanan"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deletePermintaanMakanan.mutateAsync({
            id: selectedItem.dailyPermintaanMakanan.id,
          });
          toast.info("Permintaan makanan berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default PermintaanMakananTable;
