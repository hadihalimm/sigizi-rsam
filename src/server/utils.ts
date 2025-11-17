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

export function calculateMenuOrder(day: number) {
  if (day === 31) return 5;
  const order = day % 10;
  return order === 0 ? 10 : order;
}
