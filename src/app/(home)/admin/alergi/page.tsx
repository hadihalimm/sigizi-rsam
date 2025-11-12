import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import AlergiTable from "./table";

const AlergiPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.alergi.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Alergi</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AlergiTable />
      </HydrationBoundary>
    </main>
  );
};

export default AlergiPage;
