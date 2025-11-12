import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import RuanganTable from "./table";

const RuanganPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.bangsal.getAllWithRuangan.queryOptions());
  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Bangsal &amp; Ruangan </h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RuanganTable />
      </HydrationBoundary>
    </main>
  );
};

export default RuanganPage;
