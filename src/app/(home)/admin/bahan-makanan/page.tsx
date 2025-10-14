import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import BahanMakananTable from "./table";

const BahanMakananPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.bahanMakanan.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Bahan Makanan</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BahanMakananTable />
      </HydrationBoundary>
    </main>
  );
};

export default BahanMakananPage;
