"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const C = { green:"#1B4332", gold:"#C9A84C", cream:"#FAF7F0", white:"#FFFFFF", gray:"#6B7280", red:"#991B1B", softRed:"#FEE2E2" };

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    })();
  }, [router]);

  async function handleSubmit() {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() })
        .eq("id", user.id);
      if (updateError) { setError("Could not save your name. Please try again."); return; }
      router.push("/dashboard");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#FAF7F0", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#1B4332", fontFamily:"Georgia,serif", fontSize:18 }}>Loading your planner...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.cream, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px",
      backgroundImage:"radial-gradient(ellipse at top left,#e8f5e9 0%,transparent 55%),radial-gradient(ellipse at bottom right,#fef9e7 0%,transparent 55%)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@400;600&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ color:C.gold, fontSize:10, letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Michelle Burdex</div>
        <div style={{ color:C.green, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:900, fontSize:24 }}>Daily Command Center</div>
      </div>
      <div style={{ background:C.white, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(27,67,50,0.12)", border:"1.5px solid #E5DFC8" }}>
        <div style={{ background:"linear-gradient(90deg,#F5E6C0,#fffbf0,#F5E6C0)", borderRadius:10, padding:"12px 16px", marginBottom:28, display:"flex", alignItems:"flex-start", gap:10 }}>
          <span style={{ fontSize:16 }}>✝️</span>
          <div>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", color:C.green, fontSize:13, lineHeight:1.6 }}>"She is clothed with strength and dignity, and she laughs without fear of the future."</span>
            <span style={{ display:"block", color:"#A07820", fontSize:11, fontWeight:700, marginTop:2 }}>— Proverbs 31:25</span>
          </div>
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:C.green, fontSize:26, fontWeight:900, margin:"0 0 8px" }}>Welcome!</h2>
        <p style={{ color:C.gray, fontSize:14, margin:"0 0 28px", lineHeight:1.7 }}>
          Your Daily Command Center is ready. Before we open it up, what should we call you? Your name will appear at the top of your planner every day.
        </p>
        {error && <div style={{ background:C.softRed, border:`1.5px solid ${C.red}`, borderRadius:8, padding:"10px 14px", marginBottom:18, fontSize:13, color:C.red }}>{error}</div>}
        <label style={{ display:"block", fontSize:13, fontWeight:700, color:C.green, marginBottom:8, fontFamily:"'Lora',Georgia,serif" }}>Your First Name or Preferred Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. Michelle" autoFocus
          style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:`2px solid ${C.gold}`, fontFamily:"'Lora',Georgia,serif", fontSize:16, color:C.green, background:C.cream, outline:"none", marginBottom:20 }} />
        <button onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", background:`linear-gradient(135deg,${C.green},#2D6A4F)`, color:C.white, padding:"14px", borderRadius:10, fontWeight:700, fontSize:16, border:"none", cursor:loading?"default":"pointer", opacity:loading?0.7:1, fontFamily:"'Playfair Display',Georgia,serif", boxShadow:"0 4px 16px rgba(27,67,50,0.25)" }}>
          {loading ? "Opening your planner..." : "Open My Planner →"}
        </button>
        <p style={{ color:C.gray, fontSize:12, textAlign:"center", marginTop:16, lineHeight:1.5 }}>You can update your name anytime in your account settings.</p>
      </div>
      <div style={{ marginTop:24, maxWidth:460, width:"100%", background:"linear-gradient(135deg,#0f2a1e,#1B4332)", borderRadius:14, padding:"18px 22px", border:`1.5px solid ${C.gold}` }}>
        <div style={{ color:C.gold, fontSize:9, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Today's Affirmation</div>
        <div style={{ color:C.white, fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontSize:14, lineHeight:1.7 }}>
          "I am enough. I am ready. I am resourced from within. And I am just getting started."
        </div>
      </div>
    </div>
  );
}
