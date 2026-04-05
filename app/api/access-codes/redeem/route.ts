import { NextRequest } from "next/server";
import { createAdminClient, createServerSideClient } from "@/lib/supabase/server";
import { AccessCodeSchema } from "@/lib/validation";
import { ok, err, getIP, checkRateLimit } from "@/lib/api-helpers";
import { LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Strict rate limit — 5 attempts per hour per IP
  const ip = getIP(req);
  const limited = checkRateLimit(`redeem:${ip}`, LIMITS.accessCode);
  if (limited) return limited;

  // Validate input
  let body: unknown;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const parsed = AccessCodeSchema.safeParse(body);
  if (!parsed.success) {
    return err("Invalid access code format.", 422);
  }

  // Verify the user is logged in
  const userClient = createServerSideClient();
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return err("You must be signed in to redeem an access code.", 401);
  }

  // Check if user already has access
  const { data: profile } = await userClient
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (profile?.tier === "premium") {
    return err("Your account already has Premium access.", 409);
  }

  // Use admin client to access codes table (no public RLS policy)
  const admin = createAdminClient();
  const { data: codeRow, error: codeError } = await admin
    .from("access_codes")
    .select("id, tier, redeemed, redeemed_by")
    .eq("code", parsed.data.code)
    .single();

  if (codeError || !codeRow) {
    // Always return the same message — don't confirm whether the code exists
    return err("This access code is invalid or has already been used.", 404);
  }

  if (codeRow.redeemed) {
    return err("This access code has already been redeemed.", 409);
  }

  // Mark code as redeemed.
  // FIX: Use .select("id").maybeSingle() so we can detect "0 rows updated"
  // which Supabase returns as error:null + data:null — not as an error.
  // Without this, a race condition could let two requests redeem the same
  // code and both proceed to upgrade the user's tier.
  const { data: updated, error: updateCodeError } = await admin
    .from("access_codes")
    .update({
      redeemed: true,
      redeemed_by: user.id,
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", codeRow.id)
    .eq("redeemed", false)   // only matches if STILL unredeemed
    .select("id")            // makes PostgREST return the updated row
    .maybeSingle();          // null if 0 rows matched — not an error

  if (updateCodeError) {
    console.error("Code update error:", updateCodeError);
    return err("Failed to redeem access code. Please try again.", 500);
  }

  // FIX: Treat "no row returned" as the race condition conflict.
  // This is the case where another request won the race and already
  // set redeemed=true before this request's UPDATE ran.
  if (!updated) {
    return err("This access code has already been redeemed.", 409);
  }

  // FIX: Capture and handle profile upgrade errors.
  // If this fails after a successful redemption, the code is marked used
  // but the user has no tier. We return 500 so the client knows to
  // contact support — and the code row records who redeemed it for recovery.
  const { error: tierError } = await admin
    .from("profiles")
    .update({ tier: codeRow.tier })
    .eq("id", user.id);

  if (tierError) {
    console.error("Tier upgrade failed after redemption:", tierError, {
      userId: user.id,
      codeId: codeRow.id,
      tier: codeRow.tier,
    });
    return err(
      "Your code was accepted but we could not upgrade your account. Please contact support with your order ID.",
      500
    );
  }

  return ok({
    tier: codeRow.tier,
    message: `Your account has been upgraded to ${codeRow.tier}!`,
  });
}
