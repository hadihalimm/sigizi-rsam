"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import AppAlertDialog from "@/components/app-alert-dialog";
import AppDialog from "@/components/app-dialog";
import { DropdownRowAction } from "@/components/dropdown-row-action";
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
import { pasienQuery } from "@/query/pasien";
import { orpc } from "@/server/orpc";
import { Alergi, Pasien } from "@/types/db";

import PasienForm from "./form";

export type PasienDetail = {
  pasien: Pasien;
  alergi: (Alergi | null)[];
};

const PasienTable = () => {
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearchParam] = useDebounce(searchParam, 1000);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      orpc.pasien.getAll.infiniteOptions({
        input: (cursorParam: number | undefined) => ({
          cursor: cursorParam,
          search: debouncedSearchParam,
        }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      })
    );
  const pasienList = useMemo(
    () => data.pages.flatMap((page) => page.pasienList),
    [data.pages]
  );

  const createDialog = useAppDialog("createPasien");
  const updateDialog = useAppDialog("updatePasien");
  const deleteDialog = useAppAlertDialog("deletePasien");

  const [selectedItem, setSelectedItem] = useState<PasienDetail>();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<PasienDetail>();
    return [
      columnHelper.accessor("pasien.medicalRecordNumber", {
        id: "pasienMrn",
        header: "No. MR",
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor("pasien.name", {
        id: "pasienName",
        header: "Nama",
        cell: (info) => info.getValue(),
        size: 150,
      }),
      columnHelper.accessor("pasien.dateOfBirth", {
        id: "pasienDob",
        header: "Tanggal lahir",
        cell: (info) => {
          const date = info.getValue();
          return date
            ? new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium",
              }).format(date)
            : "-";
        },
        size: 120,
      }),
      columnHelper.accessor("alergi", {
        id: "alergi",
        header: "Alergi",
        cell: (info) =>
          info
            .getValue()
            .map((alergi) => alergi?.code)
            .join(", "),
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
  }, []);

  const table = useReactTable({
    data: pasienList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { ref } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const deletePasien = pasienQuery.useDelete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-2 items-end">
        <div className="flex flex-col gap-1 w-1/2">
          <FieldLabel>Cari pasien</FieldLabel>
          <Input
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
          />
        </div>
        <Button
          className="w-1/2 h-auto whitespace-normal"
          onClick={() => createDialog.open()}
        >
          <Plus />
          <span>Tambah pasien</span>
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

      {isFetchingNextPage && <Spinner className=" mt-4 size-10 w-full" />}
      <div ref={ref} className="h-20" />

      <AppDialog id="createPasien" title="Tambah pasien">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <PasienForm />
        </Suspense>
      </AppDialog>
      <AppDialog id="updatePasien" title="Update pasien">
        <Suspense
          fallback={
            <Spinner className="size-10 flex w-full justify-center items-center" />
          }
        >
          <PasienForm initialData={selectedItem} />
        </Suspense>
      </AppDialog>
      <AppAlertDialog
        id="deletePasien"
        title="Apakah anda yakin?"
        description="Operasi ini akan menghapus data secara permanen."
        onAction={async () => {
          if (!selectedItem) return;
          await deletePasien.mutateAsync({
            id: selectedItem.pasien.id,
          });
          toast.info("Pasien berhasil dihapus.");
        }}
      />
    </div>
  );
};

export default PasienTable;
