import { existsSync } from "node:fs";
import { backupSqlite, openSqlite } from "../src/db/sqlite.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const path = process.env.SQLITE_PATH ?? "./data/wedding.sqlite";
if (!existsSync(path)) throw new Error("Database belum ada; jalankan db:migrate terlebih dahulu.");
const client = openSqlite(path);
try { console.log("Backup SQLite konsisten tersimpan:", await backupSqlite(client)); }
finally { client.close(); }
