import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import DietRekap from "./diet-rekap";
import PermintaanMakananLog from "./permintaan-log";
import PermintaanRekap from "./permintaan-rekap";
import PermintaanMakananTable from "./permintaan-table";

const PermintaanMakananPage = () => {
  const todayDate = new Date();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpc.dailyPermintaanMakanan.getAll.queryOptions({
      input: {
        date: todayDate.toLocaleDateString("en-CA"),
      },
    })
  );
  void queryClient.prefetchQuery(
    orpc.dailyPermintaanMakananLog.getAll.queryOptions({
      input: {
        date: todayDate!.toLocaleDateString("en-CA"),
      },
    })
  );
  void queryClient.prefetchQuery(orpc.makananType.getAll.queryOptions());
  void queryClient.prefetchQuery(orpc.bangsal.getAll.queryOptions());
  void queryClient.prefetchQuery(
    orpc.ruangan.getAll.queryOptions({ input: {} })
  );
  void queryClient.prefetchQuery(orpc.diet.getAll.queryOptions());
  void queryClient.prefetchQuery(orpc.treatmentClass.getAll.queryOptions());
  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Permintaan Makanan</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PermintaanMakananTable />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <PermintaanRekap />
            <DietRekap />
          </div>
          <PermintaanMakananLog className="max-h-[80vh] overflow-y-auto" />
        </div>
      </HydrationBoundary>
    </main>
  );
};

export default PermintaanMakananPage;
