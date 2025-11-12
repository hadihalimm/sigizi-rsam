import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const makananQuery = {
  useCreate: () => {
    return useMutation(
      orpc.makanan.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.makanan.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.makanan.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.makanan.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.makanan.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.makanan.key() });
        },
      })
    );
  },
};
export { makananQuery };
