import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // 'mysql' | 'sqlite' | 'turso'
  schema: "./src/db/schema",
  out: "./src/db/migration",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
