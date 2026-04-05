import { createServerSideClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Supabase redirects here after email confirmation.
// We exchange the code for a session and send the user to their dashboard.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerSideClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with a message
  return NextResponse.redirect(`${origin}/login?message=confirmation-failed`);
}
