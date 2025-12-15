import { os } from "@orpc/server";

import { auth } from "@/lib/auth";
import { SignInSchema } from "@/schemas/auth";

import { handleORPCError } from "../utils";

export const authProcedure = {
  signIn: os
    .route({ path: "/", method: "POST" })
    .input(SignInSchema)
    .handler(async ({ input }) => {
      try {
        const data = await auth.api.signInUsername({
          body: {
            username: input.username,
            password: input.password,
          },
        });

        if (data) return { success: true };
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
