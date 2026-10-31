import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";
import { connectDatabase } from "../src/db/client.ts";

const envFile = process.env.APP_ENV_FILE ?? ".env.local";
if (process.env.APP_ENV_FILE || existsSync(envFile)) process.loadEnvFile(envFile);
const client = await connectDatabase();
try {
  if (!process.env.TURSO_DATABASE_URL && (await client.execute("select name from sqlite_master where type = 'table' and name = 'invitations'")).rows.length) {
    const local = openSqlite(process.env.SQLITE_PATH ?? "./data/wedding.sqlite");
    try { console.log("Backup sebelum migrasi:", await backupSqlite(local)); }
    finally { local.close(); }
  }
  await migrate(drizzle(client), { migrationsFolder: "./drizzle/sqlite" });
  if ((await client.execute("PRAGMA foreign_key_check")).rows.length > 0) throw new Error("Integritas foreign key gagal.");
  console.log("Migrasi SQLite/libSQL selesai.");
} finally { client.close(); }
