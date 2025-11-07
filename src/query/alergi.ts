import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const alergiQuery = {
  useCreate: () => {
    return useMutation(
      orpc.alergi.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.alergi.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.alergi.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.alergi.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.alergi.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.alergi.key() });
        },
      })
    );
  },
};
export { alergiQuery };
