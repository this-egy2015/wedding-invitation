import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase";
import { db } from "@/db";
import { hasDashboardAccess } from "@/db/access";
import { isAdminEmail } from "./access-policy";

// getUser() verifies the JWT with Supabase Auth; never trust the cookie payload alone.
// Every dashboard page and server action must call this; the proxy is not an auth gate.
export const requireUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  if (!data.user.email || !data.user.email_confirmed_at || !await hasDashboardAccess(db, data.user.email)) redirect("/login");
  return { ...data.user, email: data.user.email };
});

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) notFound();
  return user;
}
