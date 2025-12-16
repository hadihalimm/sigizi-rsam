import { os } from "@orpc/server";

import { auth } from "@/lib/auth";
import { SignInSchema } from "@/schemas/auth";

import { authorized } from "../middleware";
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

  getSession: authorized
    .route({ path: "/", method: "GET" })
    .handler(async ({ context }) => {
      try {
        return { session: context.session, user: context.user };
      } catch (error) {
        handleORPCError(error);
      }
    }),

  signOut: authorized
    .route({ path: "/", method: "POST" })
    .handler(async ({ context }) => {
      try {
        await auth.api.signOut({ headers: context.headers });
      } catch (error) {
        handleORPCError(error);
      }
    }),
};
