import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

import MenuTable from "./menu-table";

const MenuPage = async ({
  params,
}: {
  params: Promise<{ "menu-book-id": string }>;
}) => {
  const { "menu-book-id": menuBookId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpc.menu.getAll.queryOptions({
      input: { menuBookId: Number(menuBookId) },
    })
  );

  return (
    <main className="flex flex-col gap-12">
      <h1 className="font-semibold text-2xl">Daftar Menu</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuTable menuBookId={Number(menuBookId)} />
      </HydrationBoundary>
    </main>
  );
};

export default MenuPage;
