import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const dailyMenuQuery = {
  useCreateManyByMenuBook: () => {
    return useMutation(
      orpc.dailyMenu.createManyByMenuBook.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.dailyMenu.key() });
        },
      })
    );
  },
};

const dailyMenuDetailQuery = {
  useUpdateDailyMenuDetail: () => {
    return useMutation(
      orpc.dailyMenuDetail.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyMenu.getAll.key(),
          });
        },
      })
    );
  },
};
export { dailyMenuDetailQuery, dailyMenuQuery };
