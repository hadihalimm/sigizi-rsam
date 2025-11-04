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
  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Permintaan Makanan</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PermintaanMakananTable />
        <div className="flex flex-col lg:flex-row gap-4">
          <PermintaanMakananLog />
          <div className="flex flex-col lg:w-1/2 gap-4">
            <PermintaanRekap />
            <DietRekap />
          </div>
        </div>
      </HydrationBoundary>
    </main>
  );
};

export default PermintaanMakananPage;
