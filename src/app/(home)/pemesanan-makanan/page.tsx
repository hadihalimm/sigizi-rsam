import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";

import BahanMakananTable from "./bahan-makanan-table";
import DailyMenu from "./daily-menu";

const PermintaanMakananPage = () => {
  const queryClient = getQueryClient();
  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Pemesanan Bahan Makanan</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DailyMenu />
        <BahanMakananTable />
      </HydrationBoundary>
    </main>
  );
};

export default PermintaanMakananPage;
