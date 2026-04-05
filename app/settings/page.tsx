import { redirect } from "next/navigation";
import { createServerSideClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, tier, org_name, org_mission, org_logo_url, primary_color, accent_color")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Only premium users can access settings
  if (profile.tier !== "premium") redirect("/dashboard");

  return <SettingsClient profile={profile} />;
}
