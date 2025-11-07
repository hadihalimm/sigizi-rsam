import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import DietTable from "./table";

const DietPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.diet.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Diet</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DietTable />
      </HydrationBoundary>
    </main>
  );
};

export default DietPage;
