import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const dailyPermintaanMakananQuery = {
  useCreate: () => {
    return useMutation(
      orpc.dailyPermintaanMakanan.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyPermintaanMakanan.key(),
          });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.dailyPermintaanMakanan.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyPermintaanMakanan.key(),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.dailyPermintaanMakananLog.key(),
          });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.dailyPermintaanMakanan.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyPermintaanMakanan.key(),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.dailyPermintaanMakananLog.key(),
          });
        },
      })
    );
  },
};

export { dailyPermintaanMakananQuery };
