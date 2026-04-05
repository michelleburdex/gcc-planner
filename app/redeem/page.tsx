"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  green: "#1B4332", gold: "#C9A84C", cream: "#FAF7F0",
  lightGreen: "#2D6A4F", softGold: "#F5E6C0",
  white: "#FFFFFF", gray: "#6B7280",
  red: "#991B1B", softRed: "#FEE2E2",
};

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState<{ tier: string } | null>(null);

  // Auto-format code input as XXXX-XXXX-XXXX
  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
    const formatted = raw.match(/.{1,4}/g)?.join("-") || raw;
    setCode(formatted);
  }

  async function handleRedeem() {
    setError("");
    if (code.replace(/-/g, "").length < 8) {
      setError("Please enter your full access code.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/access-codes/redeem", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const json = await res.json();

      if (res.status === 401) {
        // Not logged in — send to login then back here
        router.push("/login?redirectTo=/redeem");
        return;
      }
      if (!json.success) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccess({ tier: json.data.tier });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <PageShell>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={styles.heading}>You're all set!</h2>
          <p style={styles.sub}>
            Your <strong style={{ color: C.gold, textTransform: "capitalize" }}>{success.tier}</strong> access has been activated. Your Daily Command Center is ready.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ ...styles.btn, width: "100%" }}
          >
            Open My Planner
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h2 style={styles.heading}>Redeem your access code</h2>
      <p style={styles.sub}>
        Enter the code from your Etsy purchase confirmation email. You must be signed in to redeem.
      </p>

      {error && (
        <div style={{ background: C.softRed, border: `1.5px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: C.red }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>
          Access Code
        </label>
        <input
          type="text"
          value={code}
          onChange={handleCodeChange}
          placeholder="XXXX-XXXX-XXXX"
          maxLength={14}
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 8,
            border: "1.5px solid #E5DFC8",
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 22, fontWeight: 700,
            letterSpacing: 4, textAlign: "center",
            color: C.green, background: C.cream,
            boxSizing: "border-box",
          }}
        />
        <p style={{ color: C.gray, fontSize: 12, marginTop: 6 }}>
          Codes are formatted as XXXX-XXXX-XXXX and are included in your Etsy order confirmation.
        </p>
      </div>

      <button
        onClick={handleRedeem} disabled={loading}
        style={{ ...styles.btn, width: "100%", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Redeeming…" : "Redeem Code"}
      </button>

      <div style={{ marginTop: 24, background: C.softGold, borderRadius: 10, padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.green, lineHeight: 1.7 }}>
          <strong>Don't have an account yet?</strong><br />
          <Link href="/signup" style={{ color: C.green, fontWeight: 700 }}>Create your free account</Link> first, then come back here to redeem your code.
        </p>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link href="/dashboard" style={{ color: C.gray, fontSize: 13, textDecoration: "underline" }}>
          Already redeemed? Go to my planner
        </Link>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
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

const styles = {
  heading: { fontFamily: "'Playfair Display',Georgia,serif", color: C.green, fontSize: 24, fontWeight: 900, margin: "0 0 8px" } as React.CSSProperties,
  sub:     { color: C.gray, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 } as React.CSSProperties,
  btn:     { display: "block", background: C.green, color: C.white, padding: "13px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, fontFamily: "'Lora',Georgia,serif", border: "none", cursor: "pointer", textAlign: "center" as const },
};
