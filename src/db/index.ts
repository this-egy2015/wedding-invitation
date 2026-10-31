import "server-only";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "@/env";
import * as schema from "./schema";
import { openSqlite } from "./sqlite";

// Reuse the connection across dev hot reloads.
const globalForDb = globalThis as unknown as { sqlite?: ReturnType<typeof openSqlite> };

const client = globalForDb.sqlite ?? openSqlite(env.SQLITE_PATH);
if (process.env.NODE_ENV !== "production") globalForDb.sqlite = client;

export const db = drizzle(client, { schema });
