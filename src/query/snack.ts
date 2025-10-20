import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

export const snackQuery = {
  useCreate: () => {
    return useMutation(
      orpc.snack.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.snack.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.snack.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.snack.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.snack.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.snack.key() });
        },
      })
    );
  },
};
