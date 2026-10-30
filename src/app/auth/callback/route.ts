import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${env.SITE_URL}/dashboard/invitations`);
  }
  return NextResponse.redirect(`${env.SITE_URL}/login`);
}
