import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

const envFile = process.env.APP_ENV_FILE ?? ".env.local";
if (process.env.APP_ENV_FILE || existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_PATH ?? "./data/wedding.sqlite",
  },
});
