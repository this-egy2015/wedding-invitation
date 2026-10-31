import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";
import * as schema from "./schema";
import { connectDatabase } from "./client";

// Reuse the connection across dev hot reloads.
const globalForDb = globalThis as unknown as { libsql?: Awaited<ReturnType<typeof connectDatabase>> };

const client = globalForDb.libsql ?? await connectDatabase({ ...env, VERCEL: process.env.VERCEL });
if (process.env.NODE_ENV !== "production") globalForDb.libsql = client;

export const db = drizzle(client, { schema });
