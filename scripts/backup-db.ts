import { existsSync } from "node:fs";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";

const envFile = process.env.APP_ENV_FILE ?? ".env.local";
if (process.env.APP_ENV_FILE || existsSync(envFile)) process.loadEnvFile(envFile);
if (process.env.TURSO_DATABASE_URL) throw new Error("db:backup hanya untuk SQLite lokal. Gunakan backup/export Turso untuk database remote.");
const path = process.env.SQLITE_PATH ?? "./data/wedding.sqlite";
if (!existsSync(path)) throw new Error("Database belum ada; jalankan db:migrate terlebih dahulu.");
const client = openSqlite(path);
try { console.log("Backup SQLite konsisten tersimpan:", await backupSqlite(client)); }
finally { client.close(); }
