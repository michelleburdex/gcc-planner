import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimitConfig } from "./rate-limit";

// Consistent JSON response helpers
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Extract real client IP — works behind Vercel's edge proxy
export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Apply rate limiting and return an error response if exceeded
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): NextResponse | null {
  const result = rateLimit(identifier, config);
  if (!result.allowed) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Reset": String(result.resetAt),
        },
      }
    );
  }
  return null;
}
