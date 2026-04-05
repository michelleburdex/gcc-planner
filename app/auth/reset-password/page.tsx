"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = { green: "#1B4332", gold: "#C9A84C", cream: "#FAF7F0", white: "#FFFFFF", gray: "#6B7280", red: "#991B1B", softRed: "#FEE2E2" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");
  const [success,  setSuccess]    = useState(false);

  async function handleReset() {
    setError("");
    if (password.length < 8)            return setError("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password))        return setError("Password must contain at least one uppercase letter.");
    if (!/[0-9]/.test(password))        return setError("Password must contain at least one number.");
    if (password !== confirm)           return setError("Passwords do not match.");

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  if (success) return (
    <Shell>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
        <h2 style={h2}>Password updated!</h2>
        <p style={sub}>Taking you to your planner now…</p>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <h2 style={h2}>Set a new password</h2>
      <p style={sub}>Choose a strong password for your account.</p>
      {error && <div style={{ background: C.softRed, border: `1.5px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6 }}>New Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6 }}>Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your new password" style={inputStyle} />
      </div>
      <button onClick={handleReset} disabled={loading} style={{ width: "100%", background: C.green, color: C.white, padding: "13px", borderRadius: 8, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Lora',Georgia,serif" }}>
        {loading ? "Updating…" : "Update Password"}
      </button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 32, textAlign: "center" }}>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>Michelle Burdex</div>
        <div style={{ color: C.green, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: 22 }}>Daily Command Center</div>
      </Link>
      <div style={{ background: C.white, borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 440, boxShadow: "0 4px 24px rgba(27,67,50,0.10)", border: "1.5px solid #E5DFC8" }}>
        {children}
      </div>
    </div>
  );
}

const h2: React.CSSProperties       = { fontFamily: "'Playfair Display',Georgia,serif", color: "#1B4332", fontSize: 24, fontWeight: 900, margin: "0 0 8px" };
const sub: React.CSSProperties      = { color: "#6B7280", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: "#1B4332", background: "#FAF7F0", boxSizing: "border-box" };
