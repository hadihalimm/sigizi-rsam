import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/incompatible-library": "off",
      "@next/next/no-page-custom-font": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

// import { FlatCompat } from "@eslint/eslintrc";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.config({
//     extends: ["next/core-web-vitals", "next/typescript", "prettier"],
//     plugins: ["simple-import-sort"],
//     rules: {
//       "react/no-unescaped-entities": "off",
//       "@next/next/no-page-custom-font": "off",
//       "simple-import-sort/imports": "error",
//       "simple-import-sort/exports": "error",
//     },
//   }),
// ];

// export default eslintConfig;
