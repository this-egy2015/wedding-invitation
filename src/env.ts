import { z } from "zod";

export const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SITE_URL: z.url(),
    R2_PUBLIC_URL: z.url(),
  })
  .parse(process.env);
