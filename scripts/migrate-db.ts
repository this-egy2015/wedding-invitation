import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const client = openSqlite(process.env.SQLITE_PATH ?? "./data/wedding.sqlite");
try {
  if (client.prepare("select name from sqlite_master where type = 'table' and name = 'invitations'").get()) {
    console.log("Backup sebelum migrasi:", await backupSqlite(client));
  }
  migrate(drizzle(client), { migrationsFolder: "./drizzle/sqlite" });
  if (client.prepare("PRAGMA foreign_key_check").all().length > 0) throw new Error("Integritas foreign key gagal.");
  console.log("Migrasi SQLite selesai.");
} finally { client.close(); }
