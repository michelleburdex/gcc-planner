import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SignUpSchema } from "@/lib/validation";
import { ok, err, getIP, checkRateLimit } from "@/lib/api-helpers";
import { LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit by IP — 10 signup attempts per 15 minutes
  const ip = getIP(req);
  const limited = checkRateLimit(`signup:${ip}`, LIMITS.auth);
  if (limited) return limited;

  // Parse and validate input
  let body: unknown;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const parsed = SignUpSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors[0].message, 422);
  }

  const { email, password, fullName } = parsed.data;

  // Use admin client so we can set metadata on signup
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Supabase will send confirmation email
    user_metadata: { full_name: fullName },
  });

  if (error) {
    // Don't reveal whether an email is already registered
    // Always return the same message for security
    console.error("Signup error:", error.message);
    return err(
      "If this email is not already registered, you will receive a confirmation link shortly.",
      200 // 200 to prevent email enumeration
    );
  }

  // Update the profile row created by the trigger
  await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", data.user.id);

  return ok({ message: "Check your email to confirm your account." }, 201);
}
