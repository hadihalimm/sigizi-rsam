import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";

import { auth } from "@/lib/auth";

export const base = os.$context<{ headers: Headers }>();

export const authMiddleware = base.middleware(async ({ context, next }) => {
  const sessionData = await auth.api.getSession({
    headers: context.headers,
  });

  if (!sessionData?.session || !sessionData?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: sessionData.session,
      user: sessionData.user,
    },
  });
});

export const adminOnlyMiddleware = base.middleware(
  async ({ context, next }) => {
    const sessionData = await auth.api.getSession({
      headers: context.headers,
    });

    if (!sessionData?.session || !sessionData?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }
    if (!sessionData.user.role.includes("admin")) {
      throw new ORPCError("FORBIDDEN");
    }

    return next({
      context: {
        session: sessionData.session,
        user: sessionData.user,
      },
    });
  }
);

export const authorized = base.use(authMiddleware);
export const adminOnly = base.use(adminOnlyMiddleware);
