import { ORPCError } from "@orpc/client";
import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

export function handleORPCError(error: unknown): never {
  if (error instanceof DrizzleQueryError) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Drizzle error",
      data: error,
    });
  } else if (error instanceof DatabaseError) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Postgres error",
      data: error,
    });
  } else {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Unknown error",
      data: error,
    });
  }
}
