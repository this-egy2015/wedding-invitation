import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

// Reuse the connection across dev hot reloads instead of opening a new pool per reload.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// prepare: false is required by the Supabase transaction pooler.
const client = globalForDb.sql ?? postgres(env.DATABASE_URL, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.sql = client;

export const db = drizzle(client, { schema });
