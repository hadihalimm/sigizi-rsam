import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import MakananTable from "./makanan-table";
import SnackTable from "./snack-table";

const MakananPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.makanan.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Makanan & Snack</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MakananTable />
        <SnackTable />
      </HydrationBoundary>
    </main>
  );
};

export default MakananPage;
