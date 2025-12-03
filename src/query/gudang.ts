import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const stockBahanMakananHistoryQuery = {
  useCreate: () => {
    return useMutation(
      orpc.stockBahanMakananHistory.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.stockBahanMakanan.getAll.key(),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.stockBahanMakananHistory.getById.key(),
          });
        },
      })
    );
  },
};

export { stockBahanMakananHistoryQuery };
