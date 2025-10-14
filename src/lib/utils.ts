import { ORPCError } from "@orpc/client";
import { AnyFieldMeta } from "@tanstack/react-form";
import { type ClassValue, clsx } from "clsx";
import { DrizzleError } from "drizzle-orm";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleORPCError(error: unknown): never {
  if (error instanceof DrizzleError) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Drizzle error",
      data: error,
    });
  } else {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Unknown error",
      data: error,
    });
  }
}

export function isFieldInvalid(meta: AnyFieldMeta) {
  return meta.isTouched && !meta.isValid;
}
