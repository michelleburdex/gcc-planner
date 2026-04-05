import { createBrowserClient } from "@supabase/ssr";

// This client runs in the browser and uses only the public anon key.
// The anon key is safe to expose — RLS policies enforce all access rules.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
