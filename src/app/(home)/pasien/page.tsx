import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import PasienTable from "./table";

const PasienPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    orpc.pasien.getAll.infiniteOptions({
      input: (cursorParam: number | undefined) => ({
        cursor: cursorParam,
        search: "",
      }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );
  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Pasien</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PasienTable />
      </HydrationBoundary>
    </main>
  );
};

export default PasienPage;
