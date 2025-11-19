"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MoveRight } from "lucide-react";

import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

const PermintaanMakananLog = ({ className }: { className?: string }) => {
  const { dates } = useDateStore();
  const permintaanDate = dates["permintaanDate"];
  const { data: logs } = useSuspenseQuery(
    orpc.dailyPermintaanMakananLog.getAll.queryOptions({
      input: {
        date: permintaanDate.toLocaleDateString("en-CA"),
      },
    })
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );
  const { data: bangsalList } = useSuspenseQuery(
    orpc.bangsal.getAll.queryOptions()
  );
  const { data: ruanganList } = useSuspenseQuery(
    orpc.ruangan.getAll.queryOptions({ input: {} })
  );
  const { data: dietList } = useSuspenseQuery(orpc.diet.getAll.queryOptions());

  return (
    <div className={cn("flex flex-col border rounded-md", className)}>
      <h2 className="font-medium bg-primary/80 rounded-md w-fit px-2 py-1 m-4">
        Log Perubahan Permintaan
      </h2>
      {logs.map((log) => {
        const { oldValue, newValue } = log.dailyPermintaanMakananLog;
        const oldBangsal = bangsalList.find(
          (bangsal) => bangsal.id === oldValue?.bangsalId
        )?.name;
        const newBangsal = bangsalList.find(
          (bangsal) => bangsal.id === newValue?.bangsalId
        )?.name;
        const oldRuangan = ruanganList.find(
          (ruangan) => ruangan.id === oldValue?.ruanganId
        )?.name;
        const newRuangan = ruanganList.find(
          (ruangan) => ruangan.id === newValue?.ruanganId
        )?.name;
        const oldMakananType = makananTypeList.find(
          (mt) => mt.id === oldValue?.makananTypeId
        )?.name;
        const newMakananType = makananTypeList.find(
          (mt) => mt.id === newValue?.makananTypeId
        )?.name;
        const oldDiets = dietList
          .filter((diet) => oldValue?.dietIds?.includes(diet.id))
          .map((diet) => diet.name)
          .join(", ");
        const newDiets = dietList
          .filter((diet) => newValue?.dietIds?.includes(diet.id))
          .map((diet) => diet.name)
          .join(", ");
        return (
          <Item key={log.dailyPermintaanMakananLog.id}>
            <ItemContent>
              <ItemTitle className="flex gap-4 w-full">
                <p
                  className={cn(
                    "p-1 rounded-md w-[65px] text-center",
                    log.dailyPermintaanMakananLog.operation === "update"
                      ? "bg-blue-200"
                      : "bg-red-200"
                  )}
                >
                  {log.dailyPermintaanMakananLog.operation.toUpperCase()}
                </p>
                <p className="font-medium">
                  {log.pasienName} - {log.bangsalName} - {log.ruanganName}
                </p>
                <p className="font-normal text-xs text-muted-foreground ml-auto">
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                  }).format(log.dailyPermintaanMakananLog.changedAt)}
                </p>
              </ItemTitle>
              <div>
                {oldBangsal && (
                  <div className="grid grid-cols-7 gap-4 lg:ml-20">
                    <p className="col-span-2">Bangsal: </p>
                    <p className="col-span-2">{oldBangsal}</p>
                    <MoveRight className="w-full" />
                    <p className="col-span-2">{newBangsal}</p>
                  </div>
                )}
                {oldRuangan && (
                  <div className="grid grid-cols-7 gap-4 lg:ml-20">
                    <p className="col-span-2">Ruangan: </p>
                    <p className="col-span-2">{oldRuangan}</p>
                    <MoveRight className="w-full" />
                    <p className="col-span-2">{newRuangan}</p>
                  </div>
                )}
                {oldMakananType && (
                  <div className="grid grid-cols-7 gap-4 lg:ml-20">
                    <p className="col-span-2">Jenis makanan: </p>
                    <p className="col-span-2">{oldMakananType}</p>
                    <MoveRight className="w-full" />
                    <p className="col-span-2">{newMakananType}</p>
                  </div>
                )}
                {oldDiets && (
                  <div className="grid grid-cols-7 gap-4 lg:ml-20">
                    <p className="col-span-2">Diet: </p>
                    <p className="col-span-2">{oldDiets}</p>
                    <MoveRight className="w-full" />
                    <p className="col-span-2">{newDiets}</p>
                  </div>
                )}
              </div>
            </ItemContent>
          </Item>
        );
      })}
    </div>
  );
};

export default PermintaanMakananLog;
