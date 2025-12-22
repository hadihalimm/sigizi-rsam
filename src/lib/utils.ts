import { AnyFieldMeta } from "@tanstack/react-form";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFieldInvalid(meta: AnyFieldMeta) {
  return meta.isTouched && !meta.isValid;
}

export const capitalizeFirst = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export function htmlShell(body: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap"
        rel="stylesheet"
      />
      <title>Etiket Diet</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          width: 384px
          margin: 0;
        }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>`;
}
