import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ok, err } from "@/lib/api-helpers";
import { z } from "zod";

const GenerateSchema = z.object({
  tier:         z.enum(["standard", "premium"]),
  quantity:     z.number().int().min(1).max(100).default(1),
  etsyOrderId:  z.string().max(100).optional(),
});

// Very simple admin auth — check a secret header.
// For production, replace with Supabase admin role check.
function isAdmin(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ACCESS_CODE_SECRET;
}

function generateCode(): string {
  // Format: XXXX-XXXX-XXXX  (uppercase alphanumeric, no ambiguous chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `${segment()}-${segment()}-${segment()}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return err("Forbidden", 403);
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 422);

  const { tier, quantity, etsyOrderId } = parsed.data;
  const admin = createAdminClient();

  const codes = Array.from({ length: quantity }, () => ({
    code:          generateCode(),
    tier,
    etsy_order_id: etsyOrderId || null,
  }));

  const { data, error } = await admin
    .from("access_codes")
    .insert(codes)
    .select("code, tier");

  if (error) {
    console.error("Code generation error:", error);
    return err("Failed to generate codes.", 500);
  }

  return ok({ codes: data }, 201);
}
