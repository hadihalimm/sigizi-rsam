import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

export const bahanMakananQuery = {
  useCreate: () => {
    return useMutation(
      orpc.bahanMakanan.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bahanMakanan.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.bahanMakanan.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bahanMakanan.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.bahanMakanan.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bahanMakanan.key() });
        },
      })
    );
  },
};
