import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import MenuBookTable from "./menu-book-table";

const MenuBookPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.menuBook.getAll.queryOptions());

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Buku Menu</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuBookTable />
      </HydrationBoundary>
    </main>
  );
};

export default MenuBookPage;
