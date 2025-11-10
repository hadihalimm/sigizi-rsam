import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const bangsalQuery = {
  useCreate: () => {
    return useMutation(
      orpc.bangsal.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bangsal.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.bangsal.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bangsal.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.bangsal.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.bangsal.key() });
        },
      })
    );
  },
};

const ruanganQuery = {
  useCreate: () => {
    return useMutation(
      orpc.ruangan.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.ruangan.key() });
          queryClient.invalidateQueries({
            queryKey: orpc.bangsal.getAllWithRuangan.key(),
          });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.ruangan.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.ruangan.key() });
          queryClient.invalidateQueries({
            queryKey: orpc.bangsal.getAllWithRuangan.key(),
          });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.ruangan.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.ruangan.key() });
          queryClient.invalidateQueries({
            queryKey: orpc.bangsal.getAllWithRuangan.key(),
          });
        },
      })
    );
  },
};
export { bangsalQuery, ruanganQuery };
