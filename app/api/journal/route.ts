import { NextRequest } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { JournalSchema } from "@/lib/validation";
import { ok, err, getIP, checkRateLimit } from "@/lib/api-helpers";
import { LIMITS } from "@/lib/rate-limit";

// GET /api/journal?date=YYYY-MM-DD  (or all entries if no date)
export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const limited = checkRateLimit(`journal-get:${ip}`, LIMITS.api);
  if (limited) return limited;

  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("Unauthorized", 401);

  const date = req.nextUrl.searchParams.get("date");

  if (date) {
    // Single entry
    const { data, error } = await supabase
      .from("journal_entries")
      .select("entry_date, data, updated_at")
      .eq("user_id", user.id)
      .eq("entry_date", date)
      .single();

    if (error && error.code !== "PGRST116") return err("Database error", 500);
    return ok(data || null);
  }

  // All entries for archive view — return date + summary only, not full data
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_date, updated_at")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(365); // Cap at one year of entries

  if (error) return err("Database error", 500);
  return ok(data);
}

// POST /api/journal — upsert (create or update) an entry
export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limited = checkRateLimit(`journal-save:${ip}`, LIMITS.journal);
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const parsed = JournalSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors[0].message, 422);
  }

  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("Unauthorized", 401);

  // Prevent saving future dates (more than 1 day ahead)
  const entryDate = new Date(parsed.data.entryDate);
  const tomorrow  = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (entryDate > tomorrow) {
    return err("Cannot save entries for future dates.", 422);
  }

  // Upsert — creates if missing, updates if exists
  // ON CONFLICT enforced by unique(user_id, entry_date) in schema
  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id:    user.id,
        entry_date: parsed.data.entryDate,
        data:       parsed.data.data,
      },
      { onConflict: "user_id,entry_date" }
    )
    .select("entry_date, updated_at")
    .single();

  if (error) {
    console.error("Journal save error:", error);
    return err("Failed to save entry.", 500);
  }

  return ok(data);
}
