import { useMutation } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { orpc } from "@/server/orpc";

const queryClient = getQueryClient();

const dailyBahanMakananQuery = {
  useGenerateByDate: (date: string) => {
    return useMutation(
      orpc.dailyBahanMakanan.generateByDate.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyBahanMakanan.getAll.key({
              input: { date: date },
            }),
          });
        },
      })
    );
  },

  useUpdateDailyBahanMakanan: (date: string) => {
    return useMutation(
      orpc.dailyBahanMakanan.updateDailyBahanMakanan.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyBahanMakanan.getAll.key({
              input: { date: date },
            }),
          });
        },
      })
    );
  },

  useCreateDailyBahanMakanan: (date: string) => {
    return useMutation(
      orpc.dailyBahanMakanan.createDailyBahanMakanan.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: orpc.dailyBahanMakanan.getAll.key({
              input: { date: date },
            }),
          });
        },
      })
    );
  },
};

export { dailyBahanMakananQuery };
