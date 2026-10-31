import { z } from "zod";

export const env = z
  .object({
    SQLITE_PATH: z.string().min(1).default("./data/wedding.sqlite"),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SITE_URL: z.url(),
    R2_PUBLIC_URL: z.url(),
  })
  .parse(process.env);
