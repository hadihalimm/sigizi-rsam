import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const dietQuery = {
  useCreate: () => {
    return useMutation(
      orpc.diet.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.diet.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.diet.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.diet.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.diet.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.diet.key() });
        },
      })
    );
  },
};
export { dietQuery };
