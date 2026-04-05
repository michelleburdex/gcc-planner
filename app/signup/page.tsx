"use client";
import { useState } from "react";
import Link from "next/link";

const C = {
  green: "#1B4332", gold: "#C9A84C", cream: "#FAF7F0",
  lightGreen: "#2D6A4F", white: "#FFFFFF", gray: "#6B7280",
  red: "#991B1B", softRed: "#FEE2E2", softGold: "#F5E6C0",
};

export default function SignupPage() {
  const [form, setForm]       = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    setError("");
    if (!form.fullName.trim()) return setError("Please enter your name.");
    if (!form.email.trim())    return setError("Please enter your email address.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(form.password)) return setError("Password must contain at least one uppercase letter.");
    if (!/[0-9]/.test(form.password)) return setError("Password must contain at least one number.");

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || "Something went wrong."); return; }
      setSuccess(true);
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={styles.heading}>Check your email</h2>
          <p style={styles.sub}>
            We sent a confirmation link to <strong>{form.email}</strong>.<br />
            Click the link in that email to activate your account, then come back and sign in.
          </p>
          <Link href="/login" style={styles.btn}>Go to Sign In</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h2 style={styles.heading}>Create your account</h2>
      <p style={styles.sub}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: C.gold, fontWeight: 700 }}>Sign in</Link>
      </p>

      {error && <ErrorBox message={error} />}

      <Field label="Full Name">
        <Input
          type="text" placeholder="Your full name"
          value={form.fullName} onChange={set("fullName")}
          autoComplete="name"
        />
      </Field>

      <Field label="Email Address">
        <Input
          type="email" placeholder="you@email.com"
          value={form.email} onChange={set("email")}
          autoComplete="email"
        />
      </Field>

      <Field label="Password">
        <Input
          type="password" placeholder="At least 8 characters"
          value={form.password} onChange={set("password")}
          autoComplete="new-password"
        />
        <p style={styles.hint}>Must include one uppercase letter and one number.</p>
      </Field>

      <button
        onClick={handleSubmit} disabled={loading}
        style={{ ...styles.btn, width: "100%", marginTop: 8, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p style={{ ...styles.hint, textAlign: "center", marginTop: 20 }}>
        By signing up you agree that this product is provided as-is for personal use.
      </p>
    </PageShell>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6, fontFamily: "'Lora',Georgia,serif" }}>{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: C.green, background: C.cream, boxSizing: "border-box" as const }} />
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: C.softRed, border: `1.5px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.red }}>
      {message}
    </div>
  );
}

const styles = {
  heading: { fontFamily: "'Playfair Display',Georgia,serif", color: C.green, fontSize: 24, fontWeight: 900, margin: "0 0 8px" } as React.CSSProperties,
  sub:     { color: C.gray, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 } as React.CSSProperties,
  hint:    { color: C.gray, fontSize: 12, margin: "4px 0 0" } as React.CSSProperties,
  btn:     { display: "inline-block", background: C.green, color: C.white, padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, fontFamily: "'Lora',Georgia,serif", border: "none", cursor: "pointer", textDecoration: "none", textAlign: "center" as const },
};
