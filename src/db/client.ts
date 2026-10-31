import { createClient } from "@libsql/client";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function connectDatabase(config: {
  SQLITE_PATH?: string; TURSO_DATABASE_URL?: string; TURSO_AUTH_TOKEN?: string; VERCEL?: string;
} = { SQLITE_PATH: process.env.SQLITE_PATH, TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL, TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN, VERCEL: process.env.VERCEL }) {
  if (config.TURSO_DATABASE_URL) {
    const url = new URL(config.TURSO_DATABASE_URL);
    if (!["libsql:", "https:"].includes(url.protocol) || url.username || url.password || !config.TURSO_AUTH_TOKEN) {
      throw new Error("Turso memerlukan URL libsql/https dan token privat.");
    }
    return createClient({ url: config.TURSO_DATABASE_URL, authToken: config.TURSO_AUTH_TOKEN });
  }
  if (config.VERCEL || config.TURSO_AUTH_TOKEN) throw new Error("TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib diisi untuk Vercel.");
  const { openSqlite } = await import("./sqlite.ts");
  const filename = config.SQLITE_PATH ?? "./data/wedding.sqlite";
  openSqlite(filename).close();
  return createClient({ url: pathToFileURL(resolve(/* turbopackIgnore: true */ filename)).href, timeout: 5000 });
}
