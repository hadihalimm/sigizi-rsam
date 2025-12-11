import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, customSession, username } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import db from "@/db";
import { user as userTable } from "@/db/schema/user";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // disableSignUp: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60,
    },
  },
  plugins: [
    username(),
    admin(),
    customSession(async ({ user, session }) => {
      const record = await db.query.user.findFirst({
        columns: {
          role: true,
        },
        where: eq(userTable.id, user.id),
      });
      return {
        user: {
          ...user,
          role: record?.role,
        },
        session,
      };
    }),
    nextCookies(),
  ],
});
