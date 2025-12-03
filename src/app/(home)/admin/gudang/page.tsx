import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import StockBahanMakananTable from "./table";

const GudangPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.stockBahanMakanan.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Gudang Bahan Makanan</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StockBahanMakananTable />
      </HydrationBoundary>
    </main>
  );
};

export default GudangPage;
