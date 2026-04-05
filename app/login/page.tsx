"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = {
  green: "#1B4332", gold: "#C9A84C", cream: "#FAF7F0",
  white: "#FFFFFF", gray: "#6B7280",
  red: "#991B1B", softRed: "#FEE2E2",
};

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") || "/dashboard";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    setError("");
    if (!form.email.trim())    return setError("Please enter your email address.");
    if (!form.password.trim()) return setError("Please enter your password.");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (authError) { setError("The email or password you entered is incorrect."); return; }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!form.email.trim()) { setError("Enter your email address above, then click Forgot Password."); return; }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(form.email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
    setError("");
    alert("If that email is registered, you will receive a password reset link shortly.");
    setLoading(false);
  }

  return (
    <PageShell>
      <h2 style={styles.heading}>Welcome back</h2>
      <p style={styles.sub}>
        Don't have an account?{" "}
        <Link href="/signup" style={{ color: C.gold, fontWeight: 700 }}>Sign up</Link>
      </p>
      {error && <ErrorBox message={error} />}
      <Field label="Email Address">
        <Input type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} autoComplete="email" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </Field>
      <Field label="Password">
        <Input type="password" placeholder="Your password" value={form.password} onChange={set("password")} autoComplete="current-password" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </Field>
      <div style={{ textAlign: "right", marginTop: -10, marginBottom: 20 }}>
        <button onClick={handleForgotPassword} disabled={loading} style={{ background: "none", border: "none", color: C.gold, fontSize: 13, cursor: "pointer", fontFamily: "'Lora',Georgia,serif", padding: 0 }}>
          Forgot password?
        </button>
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn, width: "100%", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <div style={{ marginTop: 24, padding: "16px", background: "#F5E6C0", borderRadius: 10, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.green, lineHeight: 1.6 }}>
          Just purchased on Etsy?{" "}
          <Link href="/redeem" style={{ color: C.green, fontWeight: 700, textDecoration: "underline" }}>Redeem your access code here.</Link>
        </p>
      </div>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAF7F0", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: C.green, background: C.cream, boxSizing: "border-box" as const }} />;
}

function ErrorBox({ message }: { message: string }) {
  return <div style={{ background: C.softRed, border: `1.5px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.red }}>{message}</div>;
}

const styles = {
  heading: { fontFamily: "'Playfair Display',Georgia,serif", color: C.green, fontSize: 24, fontWeight: 900, margin: "0 0 8px" } as React.CSSProperties,
  sub:     { color: C.gray, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 } as React.CSSProperties,
  btn:     { display: "block", background: C.green, color: C.white, padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, fontFamily: "'Lora',Georgia,serif", border: "none", cursor: "pointer", textAlign: "center" as const },
};
