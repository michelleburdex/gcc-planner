import { NextRequest } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase/server";
import { ok, err, getIP, checkRateLimit } from "@/lib/api-helpers";
import { LIMITS } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  // More restrictive limit for uploads
  const ip      = getIP(req);
  const limited = checkRateLimit(`logo-upload:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (limited) return limited;

  const supabase = createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("Unauthorized", 401);

  // Premium only
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (profile?.tier !== "premium") {
    return err("Logo upload is available for Premium accounts only.", 403);
  }

  // Parse multipart form
  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return err("Could not parse upload.", 400); }

  const file = formData.get("logo");
  if (!file || !(file instanceof File)) return err("No file provided.", 400);

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return err("File type not allowed. Please upload PNG, JPG, WebP, or SVG.", 422);
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return err("File is too large. Maximum size is 2 MB.", 422);
  }

  const ext      = file.type.split("/")[1].replace("svg+xml", "svg");
  const filePath = `${user.id}/logo.${ext}`;
  const buffer   = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();

  // Delete old logo if exists
  await admin.storage.from("logos").remove([filePath]);

  // Upload new logo
  const { error: uploadError } = await admin.storage
    .from("logos")
    .upload(filePath, buffer, {
      contentType:  file.type,
      upsert:       true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Logo upload error:", uploadError);
    return err("Upload failed. Please try again.", 500);
  }

  // Get a signed URL (private bucket — signed URLs expire but we refresh on load)
  const { data: signedUrl } = await admin.storage
    .from("logos")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

  if (!signedUrl) return err("Could not generate logo URL.", 500);

  // Save URL to profile
  await admin
    .from("profiles")
    .update({ org_logo_url: signedUrl.signedUrl })
    .eq("id", user.id);

  return ok({ logoUrl: signedUrl.signedUrl });
}
