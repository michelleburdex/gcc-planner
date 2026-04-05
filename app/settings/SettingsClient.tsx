"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  id:            string;
  full_name:     string | null;
  tier:          "standard" | "premium";
  org_name:      string | null;
  org_mission:   string | null;
  org_logo_url:  string | null;
  primary_color: string | null;
  accent_color:  string | null;
}

const PRESET_COLORS = [
  { primary: "#1B4332", accent: "#C9A84C", name: "Forest & Gold (Default)"   },
  { primary: "#1E3A5F", accent: "#F4A261", name: "Navy & Coral"               },
  { primary: "#4A1942", accent: "#F7B731", name: "Plum & Amber"               },
  { primary: "#0D3B66", accent: "#EE964B", name: "Midnight & Tangerine"       },
  { primary: "#2C3E50", accent: "#E74C3C", name: "Slate & Crimson"            },
  { primary: "#1A472A", accent: "#FFD700", name: "Deep Green & Gold"          },
  { primary: "#3D2B1F", accent: "#D4A96A", name: "Espresso & Caramel"        },
  { primary: "#1B2A4A", accent: "#66C5CC", name: "Indigo & Teal"              },
];

export default function SettingsClient({ profile }: { profile: Profile }) {
  const router   = useRouter();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [fullName,      setFullName]      = useState(profile.full_name     || "");
  const [orgName,       setOrgName]       = useState(profile.org_name      || "");
  const [orgMission,    setOrgMission]    = useState(profile.org_mission   || "");
  const [primaryColor,  setPrimaryColor]  = useState(profile.primary_color || "#1B4332");
  const [accentColor,   setAccentColor]   = useState(profile.accent_color  || "#C9A84C");
  const [logoUrl,       setLogoUrl]       = useState(profile.org_logo_url  || "");
  const [logoPreview,   setLogoPreview]   = useState(profile.org_logo_url  || "");

  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [saveMsg,       setSaveMsg]       = useState("");
  const [saveErr,       setSaveErr]       = useState("");
  const [uploadErr,     setUploadErr]     = useState("");

  // ── Logo upload ────────────────────────────────────────────────────────
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");

    if (file.size > 2 * 1024 * 1024) {
      setUploadErr("File is too large. Maximum size is 2 MB."); return;
    }
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setUploadErr("Please upload a PNG, JPG, WebP, or SVG file."); return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res  = await fetch("/api/profile/logo", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) { setUploadErr(json.error || "Upload failed."); return; }
      setLogoUrl(json.data.logoUrl);
    } catch {
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  // ── Save profile ───────────────────────────────────────────────────────
  async function handleSave() {
    setSaveErr(""); setSaveMsg("");
    if (!fullName.trim()) { setSaveErr("Please enter your name."); return; }

    setSaving(true);
    try {
      const res  = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName, orgName, orgMission, primaryColor, accentColor }),
      });
      const json = await res.json();
      if (!json.success) { setSaveErr(json.error || "Save failed."); return; }
      setSaveMsg("Settings saved! Your planner will reflect these changes.");
      setTimeout(() => setSaveMsg(""), 4000);
      router.refresh();
    } catch {
      setSaveErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const lightPrimary = "#2D6A4F";

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F0", fontFamily: "'Lora',Georgia,serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@400;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${primaryColor},${lightPrimary})`, padding: "24px 28px", borderBottom: `4px solid ${accentColor}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: accentColor, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Premium Account</div>
            <div style={{ color: "#FFFFFF", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: 24 }}>Planner Settings</div>
          </div>
          <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.12)", color: "#FFFFFF", border: `1px solid ${accentColor}`, borderRadius: 20, padding: "8px 18px", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            ← Back to Planner
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Save messages */}
        {saveMsg && <div style={{ background: "#D1FAE5", border: "1.5px solid #059669", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#065F46" }}>✓ {saveMsg}</div>}
        {saveErr && <div style={{ background: "#FEE2E2", border: "1.5px solid #991B1B", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#991B1B" }}>{saveErr}</div>}

        {/* ── SECTION: Your Name ── */}
        <SettingsCard title="Your Name" icon="👤">
          <Label>Display Name</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
          <Hint>This appears in the planner header as "[Name]'s Daily Command Center"</Hint>
        </SettingsCard>

        {/* ── SECTION: Organization ── */}
        <SettingsCard title="Organization Branding" icon="🏛️">
          <Label>Organization Name</Label>
          <Input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your organization name" maxLength={200} />
          <Hint>Replaces "Daily Command Center" in the header when set.</Hint>

          <div style={{ marginTop: 18 }}>
            <Label>Mission Statement</Label>
            <textarea value={orgMission} onChange={e => setOrgMission(e.target.value)}
              placeholder="Your organization's mission in one or two sentences…"
              maxLength={1000}
              style={{ width: "100%", minHeight: 90, padding: "10px 12px", border: "1.5px solid #E5DFC8", borderRadius: 8, fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: "#1B4332", background: "#FAF7F0", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            <Hint>Optional. Displayed in the Notes tab as a daily reminder of your why.</Hint>
          </div>
        </SettingsCard>

        {/* ── SECTION: Logo ── */}
        <SettingsCard title="Organization Logo" icon="🖼️">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            {/* Preview */}
            <div style={{ width: 120, height: 80, borderRadius: 10, border: "1.5px solid #E5DFC8", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                : <span style={{ color: "#9CA3AF", fontSize: 12 }}>No logo</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoChange} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ background: primaryColor, color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "'Lora',Georgia,serif", fontWeight: 700, fontSize: 14, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.7 : 1 }}>
                {uploading ? "Uploading…" : logoPreview ? "Change Logo" : "Upload Logo"}
              </button>
              {uploadErr && <div style={{ color: "#991B1B", fontSize: 13, marginTop: 8 }}>{uploadErr}</div>}
              <Hint>PNG, JPG, WebP, or SVG. Maximum 2 MB. Appears in the planner header.</Hint>
            </div>
          </div>
        </SettingsCard>

        {/* ── SECTION: Colors ── */}
        <SettingsCard title="Brand Colors" icon="🎨">
          <div style={{ marginBottom: 20 }}>
            <Label>Color Presets</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginTop: 8 }}>
              {PRESET_COLORS.map((preset, i) => {
                const active = primaryColor === preset.primary && accentColor === preset.accent;
                return (
                  <button key={i} onClick={() => { setPrimaryColor(preset.primary); setAccentColor(preset.accent); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `2px solid ${active ? preset.accent : "#E5DFC8"}`, background: active ? preset.primary : "#FFFFFF", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: preset.primary }} />
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: preset.accent  }} />
                    </div>
                    <span style={{ fontSize: 12, color: active ? "#FFFFFF" : "#374151", fontWeight: active ? 700 : 400 }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Label>Primary Color</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 8, border: "1.5px solid #E5DFC8", cursor: "pointer", padding: 2 }} />
                <input type="text" value={primaryColor} onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && setPrimaryColor(e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: "#1B4332", background: "#FAF7F0", outline: "none" }} />
              </div>
              <Hint>Header background, section headings</Hint>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 8, border: "1.5px solid #E5DFC8", cursor: "pointer", padding: 2 }} />
                <input type="text" value={accentColor} onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && setAccentColor(e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: "#1B4332", background: "#FAF7F0", outline: "none" }} />
              </div>
              <Hint>Scripture banner, gold accents, highlights</Hint>
            </div>
          </div>

          {/* Live preview strip */}
          <div style={{ marginTop: 20, borderRadius: 12, overflow: "hidden", border: "1.5px solid #E5DFC8" }}>
            <div style={{ background: `linear-gradient(135deg,${primaryColor},#2D6A4F)`, padding: "14px 18px", borderBottom: `3px solid ${accentColor}` }}>
              <div style={{ color: accentColor, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Color Preview</div>
              <div style={{ color: "#FFFFFF", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: 18 }}>
                {orgName || fullName || "Your"}'s Daily Command Center
              </div>
            </div>
            <div style={{ background: `linear-gradient(90deg,${accentColor}22,#fffbf0,${accentColor}22)`, padding: "10px 18px", borderBottom: `1.5px solid ${accentColor}` }}>
              <span style={{ fontStyle: "italic", color: primaryColor, fontSize: 13 }}>"Trust in the Lord with all your heart…" </span>
              <span style={{ color: "#A07820", fontSize: 12, fontWeight: 700 }}>— Proverbs 3:5</span>
            </div>
          </div>
        </SettingsCard>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", background: primaryColor, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "16px", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: 18, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 8, boxShadow: `0 4px 20px ${primaryColor}44` }}>
          {saving ? "Saving…" : "Save All Settings"}
        </button>

        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 16 }}>
          Changes apply immediately when you return to your planner.
        </p>
      </div>
    </div>
  );
}

// ── UI helpers ─────────────────────────────────────────────────────────────
function SettingsCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px 24px", marginBottom: 20, border: "1.5px solid #E5DFC8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: "#1B4332", fontSize: 17 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1B4332", marginBottom: 6 }}>{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5DFC8", fontFamily: "'Lora',Georgia,serif", fontSize: 14, color: "#1B4332", background: "#FAF7F0", outline: "none", boxSizing: "border-box" }} />;
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#9CA3AF", fontSize: 12, margin: "5px 0 0", lineHeight: 1.5 }}>{children}</p>;
}
