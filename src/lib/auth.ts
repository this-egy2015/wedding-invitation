import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase";

// getUser() verifies the JWT with Supabase Auth; never trust the cookie payload alone.
// Every dashboard page and server action must call this; the proxy is not an auth gate.
export const requireUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return data.user;
});
