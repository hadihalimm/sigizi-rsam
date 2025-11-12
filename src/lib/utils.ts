import { AnyFieldMeta } from "@tanstack/react-form";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFieldInvalid(meta: AnyFieldMeta) {
  return meta.isTouched && !meta.isValid;
}
