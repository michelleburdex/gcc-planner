import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FAF7F0" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
        borderBottom: "4px solid #C9A84C",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <p style={{ color: "#C9A84C", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
          Michelle Burdex · Nonprofit Leadership Tools
        </p>
        <h1 style={{
          color: "#FFFFFF", fontSize: "clamp(32px, 6vw, 56px)",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15,
        }}>
          The Daily Command Center
        </h1>
        <p style={{ color: "#A7D5B5", fontSize: 18, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          A faith-based digital productivity journal built specifically for nonprofit professionals, grant writers, and emerging executive leaders.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            background: "#C9A84C", color: "#1B4332", padding: "14px 32px",
            borderRadius: 8, fontWeight: 700, fontSize: 16,
            textDecoration: "none", fontFamily: "'Lora', Georgia, serif",
          }}>
            Get Access
          </Link>
          <Link href="/login" style={{
            background: "transparent", color: "#FFFFFF", padding: "14px 32px",
            borderRadius: 8, fontWeight: 600, fontSize: 16,
            textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.4)",
            fontFamily: "'Lora', Georgia, serif",
          }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1B4332", fontSize: 28, textAlign: "center", marginBottom: 48 }}>
          Everything you need. Nothing you don't.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            { icon: "✝️",  title: "Daily Scripture",           body: "A new verse every morning to center your spirit before the work begins." },
            { icon: "✍🏾", title: "7 Task Categories",         body: "Grant work, follow-ups, children's book, reopening, leadership — all organized." },
            { icon: "📖",  title: "Persistent Journal",        body: "Every entry saves to your account. Flip back through past days anytime." },
            { icon: "👑",  title: "Power Map & Leadership",    body: "Reflection prompts and a weekly checklist to keep your executive goals in view." },
            { icon: "🌿",  title: "Protected Mental Breaks",   body: "Two built-in breaks per day. Rest is not a luxury. It is maintenance." },
            { icon: "✨",  title: "Premium Customization",     body: "Add your own logo, colors, and mission statement. Make it yours." },
          ].map((f, i) => (
            <div key={i} style={{ background: "#FFFFFF", borderRadius: 14, padding: 24, border: "1.5px solid #E5DFC8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ color: "#1B4332", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ marginTop: 72, textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1B4332", fontSize: 28, marginBottom: 40 }}>
            Simple, one-time pricing.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 640, margin: "0 auto" }}>
            {[
              { tier: "Standard", price: "$12", features: ["All planner features", "Daily scripture & affirmation", "Full journal archive", "GCC-inspired green & gold design", "Lifetime access"] },
              { tier: "Premium",  price: "$25", features: ["Everything in Standard", "Upload your organization logo", "Set your mission statement", "Choose your brand colors", "Your name on the planner"], highlight: true },
            ].map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? "linear-gradient(135deg,#1B4332,#2D6A4F)" : "#FFFFFF",
                borderRadius: 16, padding: 28, border: `2px solid ${p.highlight ? "#C9A84C" : "#E5DFC8"}`,
                boxShadow: p.highlight ? "0 8px 32px rgba(27,67,50,0.25)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ color: p.highlight ? "#C9A84C" : "#A07820", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{p.tier}</div>
                <div style={{ color: p.highlight ? "#FFFFFF" : "#1B4332", fontSize: 40, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, marginBottom: 20 }}>{p.price}</div>
                {p.features.map((f, j) => (
                  <div key={j} style={{ color: p.highlight ? "#C8E6D0" : "#4B5563", fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#C9A84C" }}>✓</span> {f}
                  </div>
                ))}
                <p style={{ color: p.highlight ? "#A7D5B5" : "#6B7280", fontSize: 12, marginTop: 16, fontStyle: "italic" }}>
                  Purchase on Etsy, then redeem your code here.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 64, color: "#9CA3AF", fontSize: 12, letterSpacing: 1 }}>
          <p style={{ margin: "0 0 4px" }}>Daily Command Center · Created by Michelle Burdex</p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Michelle Burdex · All Rights Reserved</p>
        </div>
      </div>
    </main>
  );
}
