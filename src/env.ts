import { z } from "zod";

const vercelHost = process.env.VERCEL_ENV === "production"
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  : process.env.VERCEL_URL;

export const env = z
  .object({
    SQLITE_PATH: z.string().min(1).default("./data/wedding.sqlite"),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SITE_URL: z.url(),
    TURSO_DATABASE_URL: z.url().optional(),
    TURSO_AUTH_TOKEN: z.string().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (!process.env.VERCEL) return;
    for (const key of ["SUPABASE_URL", "SITE_URL"] as const) {
      const url = new URL(value[key]);
      if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
        context.addIssue({ code: "custom", path: [key], message: "Vercel memerlukan URL HTTPS hosted, bukan localhost." });
      }
    }
  })
  .parse({
    ...process.env,
    SITE_URL: process.env.SITE_URL ?? (process.env.VERCEL && vercelHost ? `https://${vercelHost}` : undefined),
    SUPABASE_URL: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
