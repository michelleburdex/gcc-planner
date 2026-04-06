"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = { green:"#1B4332", gold:"#C9A84C", cream:"#FAF7F0", white:"#FFFFFF", gray:"#6B7280", red:"#991B1B", softRed:"#FEE2E2" };

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) { setError(err.message); return; }
      setSent(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  if (sent) return (
    <Shell>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>✉️</div>
        <h2 style={S.h2}>Check your email</h2>
        <p style={S.sub}>We sent a magic link to <strong>{email}</strong>. Click it to access your planner. No password needed.</p>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <h2 style={S.h2}>Welcome back</h2>
      <p style={S.sub}>Enter your email and we will send you a magic link. No password needed. New here? <Link href="/signup" style={{color:C.gold,fontWeight:700}}>Get access</Link></p>
      {error && <div style={{background:C.softRed,border:`1.5px solid ${C.red}`,borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:13,color:C.red}}>{error}</div>}
      <label style={{display:"block",fontSize:13,fontWeight:700,color:C.green,marginBottom:6}}>Email Address</label>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
        onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
        style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #E5DFC8",fontFamily:"'Lora',Georgia,serif",fontSize:14,color:C.green,background:C.cream,boxSizing:"border-box",marginBottom:18}} />
      <button onClick={handleSubmit} disabled={loading}
        style={{width:"100%",background:C.green,color:C.white,padding:"12px",borderRadius:8,fontWeight:700,fontSize:15,border:"none",cursor:"pointer",opacity:loading?0.7:1,fontFamily:"'Lora',Georgia,serif"}}>
        {loading?"Sending…":"Send Magic Link"}
      </button>
      <div style={{marginTop:24,padding:"16px",background:"#F5E6C0",borderRadius:10,textAlign:"center"}}>
        <p style={{margin:0,fontSize:13,color:C.green,lineHeight:1.6}}>Just purchased on Etsy? <Link href="/redeem" style={{color:C.green,fontWeight:700,textDecoration:"underline"}}>Redeem your access code here.</Link></p>
      </div>
    </Shell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#FAF7F0",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function Shell({children}:{children:React.ReactNode}) {
  return (
    <div style={{minHeight:"100vh",background:C.cream,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <Link href="/" style={{textDecoration:"none",marginBottom:32,textAlign:"center"}}>
        <div style={{color:C.gold,fontSize:10,letterSpacing:3,textTransform:"uppercase"}}>Michelle Burdex</div>
        <div style={{color:C.green,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:900,fontSize:22}}>Daily Command Center</div>
      </Link>
      <div style={{background:C.white,borderRadius:16,padding:"36px 32px",width:"100%",maxWidth:440,boxShadow:"0 4px 24px rgba(27,67,50,0.10)",border:"1.5px solid #E5DFC8"}}>
        {children}
      </div>
    </div>
  );
}

const S = {
  h2:{fontFamily:"'Playfair Display',Georgia,serif",color:"#1B4332",fontSize:24,fontWeight:900,margin:"0 0 8px"} as React.CSSProperties,
  sub:{color:"#6B7280",fontSize:14,margin:"0 0 24px",lineHeight:1.6} as React.CSSProperties,
};
