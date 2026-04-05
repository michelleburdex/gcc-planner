import { redirect } from "next/navigation";
import { createServerSideClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createServerSideClient();

  // Verify session server-side — middleware also checks, this is belt-and-suspenders
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load profile (tier, customization settings)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, tier, org_name, org_mission, org_logo_url, primary_color, accent_color")
    .eq("id", user.id)
    .single();

  // If profile missing (edge case), redirect to login
  if (!profile) redirect("/login");

  // Load all journal entry dates for archive drawer (not full data — just dates)
  const { data: entryDates } = await supabase
    .from("journal_entries")
    .select("entry_date")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(365);

  return (
    <DashboardClient
      profile={profile}
      entryDates={(entryDates || []).map(r => r.entry_date)}
    />
  );
}
