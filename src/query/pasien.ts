import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const pasienQuery = {
  useCreate: () => {
    return useMutation(
      orpc.pasien.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.pasien.getAll.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.pasien.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.pasien.getAll.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.pasien.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.pasien.getAll.key() });
        },
      })
    );
  },
};

export { pasienQuery };
