import { NextRequest } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase/server";
import { ProfileUpdateSchema } from "@/lib/validation";
import { ok, err, getIP, checkRateLimit } from "@/lib/api-helpers";
import { LIMITS } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip      = getIP(req);
  const limited = checkRateLimit(`profile-get:${ip}`, LIMITS.api);
  if (limited) return limited;

  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("Unauthorized", 401);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, tier, org_name, org_mission, org_logo_url, primary_color, accent_color")
    .eq("id", user.id)
    .single();

  if (error) return err("Could not load profile.", 500);
  return ok(data);
}

export async function PATCH(req: NextRequest) {
  const ip      = getIP(req);
  const limited = checkRateLimit(`profile-update:${ip}`, LIMITS.api);
  if (limited) return limited;

  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 422);

  // Check tier — only premium users can set org fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  const updates: Record<string, string> = {};

  if (parsed.data.fullName !== undefined) {
    updates.full_name = parsed.data.fullName;
  }

  if (profile?.tier === "premium") {
    if (parsed.data.orgName    !== undefined) updates.org_name    = parsed.data.orgName;
    if (parsed.data.orgMission !== undefined) updates.org_mission = parsed.data.orgMission;
    if (parsed.data.primaryColor !== undefined) updates.primary_color = parsed.data.primaryColor;
    if (parsed.data.accentColor  !== undefined) updates.accent_color  = parsed.data.accentColor;
  }

  if (Object.keys(updates).length === 0) return err("No valid fields to update.", 422);

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return err("Failed to update profile.", 500);
  }

  return ok({ message: "Profile updated successfully." });
}
