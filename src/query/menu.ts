import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const menuQuery = {
  useCreate: () => {
    return useMutation(
      orpc.menu.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menu.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.menu.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menu.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.menu.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menu.key() });
        },
      })
    );
  },
};

const menuBookQuery = {
  useCreate: () => {
    return useMutation(
      orpc.menuBook.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menuBook.key() });
        },
      })
    );
  },
  useUpdate: () => {
    return useMutation(
      orpc.menuBook.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menuBook.key() });
        },
      })
    );
  },
  useDelete: () => {
    return useMutation(
      orpc.menuBook.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.menuBook.key() });
        },
      })
    );
  },
};

export { menuBookQuery, menuQuery };
