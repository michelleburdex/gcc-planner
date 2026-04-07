"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────
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

interface DashboardClientProps {
  profile:    Profile;
  entryDates: string[];
}

interface Task   { text: string; done: boolean; }
interface DayData {
  tasks:       Record<string, Task[]>;
  power:       Record<number, string>;
  checks:      Record<number, boolean>;
  intention:   string;
  brainDump:   string;
  reflections: string[];
}

// ── Content data ───────────────────────────────────────────────────────────
const SCRIPTURES = [
  { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { verse: "She is clothed with strength and dignity, and she laughs without fear of the future.", ref: "Proverbs 31:25" },
  { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", ref: "Proverbs 3:5-6" },
  { verse: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { verse: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.", ref: "Ephesians 3:20" },
  { verse: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", ref: "Romans 12:2" },
  { verse: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.", ref: "Ephesians 2:10" },
  { verse: "The steps of a good man are ordered by the Lord, and He delights in his way.", ref: "Psalm 37:23" },
  { verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { verse: "With God all things are possible.", ref: "Matthew 19:26" },
  { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9" },
];

const AFFIRMATIONS = [
  "I am called to lead, equipped to serve, and positioned to make history. The work I do today is a love letter to generations who come after me.",
  "My voice carries weight. Every word I speak and every grant I write is an act of restoration and power.",
  "I do not have to earn my place at the table. I was built for rooms like this. I walk in with confidence, competence, and grace.",
  "I am growing into the leader I was always meant to be. Progress is happening even when I cannot see it.",
  "My presence is valuable. My perspective is necessary. My work matters beyond what any title can contain.",
  "I attract the right partnerships, the right funding, and the right opportunities because I show up fully and faithfully.",
  "Rest is not weakness. It is the discipline of someone who plans to keep going for a very long time.",
  "I am not just a builder. I am a cultural architect. A keeper of memory. A builder of futures.",
  "Every door I open for this mission is a door I am also opening for myself.",
  "I lead with integrity and warmth. People trust me because I show them I am worthy of it, every single day.",
  "I am not behind. I am right on time. My journey is unfolding exactly as it should.",
  "The next level is not a distant dream. It is a decision I am making with every intentional action today.",
  "I am enough. I am ready. I am resourced from within. And I am just getting started.",
  "We did not come this far to only come this far. We are headed to greatness.",
];

const LEADER_HABITS = [
  "Send one meaningful outreach message today — a call, a text, an email. Just one person who matters to your network.",
  "Speak in a room today. Offer a perspective, ask a strong question, or share a win.",
  "Review your email signature. Does it reflect your full title and vision?",
  "Read one article related to nonprofit leadership. Ten minutes counts.",
  "Write one sentence today that could become a speech, a blog post, or a grant opener. Save it.",
  "Identify one meeting this week where you should be in the room but are not. Take a step toward getting there.",
  "Check in on one relationship in your power map. Even a short reply keeps the connection warm.",
];

const PRIORITY_LEVELS = [
  { key: "must",      label: "Must Do Today",              color: "#991B1B",  bg: "#FEE2E2"   },
  { key: "followup",  label: "Follow Up",                  color: "#92400E",  bg: "#FEF3C7"   },
  { key: "grant",     label: "Grant Work",                 color: "#1B4332",  bg: "#D1FAE5"   },
  { key: "project",   label: "Project / Creative Work",    color: "#5B21B6",  bg: "#EDE9FE"   },
  { key: "comms",     label: "Communications & Marketing", color: "#0369A1",  bg: "#E0F2FE"   },
  { key: "power",     label: "Power Map & Leadership Dev", color: "#BE185D",  bg: "#FCE7F3"   },
  { key: "milestone", label: "Milestone / Deadline",       color: "#A07820",  bg: "#F5E6C0"   },
];

const BLOCKS = [
  { time: "8:30 – 9:00",   label: "Morning Planning",               icon: "🌅", type: "planning" },
  { time: "9:00 – 11:00",  label: "Deep Work Block",                icon: "✍🏾", type: "deep"    },
  { time: "11:00 – 11:10", label: "Mental Break",                   icon: "🌿", type: "break"   },
  { time: "11:10 – 12:30", label: "Meetings / Calls",               icon: "🤝🏾", type: "meet"   },
  { time: "12:30 – 1:15",  label: "Lunch (Protected)",              icon: "🍃", type: "break"   },
  { time: "1:15 – 2:30",   label: "Email Triage & Research",        icon: "📬", type: "email"   },
  { time: "2:30 – 2:40",   label: "Mental Break",                   icon: "🌿", type: "break"   },
  { time: "2:40 – 4:00",   label: "Program Work / Documentation",   icon: "📋", type: "program" },
  { time: "4:00 – 4:30",   label: "Wrap-Up & Tomorrow Prep",        icon: "✅", type: "wrap"    },
];

const POWER_PROMPTS = [
  { icon: "🔗", label: "Relationships to Nurture",       hint: "Who needs a touchpoint this week?" },
  { icon: "🏛️", label: "Boards, Committees & Groups",    hint: "Which tables are you sitting at? Which ones are you missing?" },
  { icon: "📣", label: "Visibility Actions",              hint: "Where can you show up, speak, or be seen as a leader this week?" },
  { icon: "👑", label: "Leadership Readiness",            hint: "What skill or credential are you actively building toward your next role?" },
  { icon: "✨", label: "Presence & Perception",           hint: "Are your bio, email signature, and public materials current and strong?" },
];

const LEADERSHIP_CHECKS = [
  "Updated my bio or professional summary in the last 30 days",
  "Attended or requested to attend a leadership meeting or board session",
  "Sent a thought leadership email, social post, or article share",
  "Had a meaningful conversation with a mentor or senior colleague",
  "Created and reviewed my power map and added or removed at least one connection",
  "Researched a job posting at my target level just to benchmark expectations",
  "Identified one thing I want to be known for and acted on it today",
];

// ── Helpers ────────────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().slice(0, 10); }

function formatDisplayDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function dayOfYear(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Math.floor((new Date(y, m - 1, d).getTime() - new Date(y, 0, 0).getTime()) / 86400000);
}

function pickByDay<T>(arr: T[], key: string): T {
  return arr[dayOfYear(key) % arr.length];
}

function emptyDay(): DayData {
  return {
    tasks:       Object.fromEntries(PRIORITY_LEVELS.map(l => [l.key, []])),
    power:       Object.fromEntries(POWER_PROMPTS.map((_, i) => [i, ""])),
    checks:      Object.fromEntries(LEADERSHIP_CHECKS.map((_, i) => [i, false])),
    intention:   "",
    brainDump:   "",
    reflections: ["", "", "", ""],
  };
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DashboardClient({ profile, entryDates }: DashboardClientProps) {
  const router = useRouter();

  const primaryColor = profile.primary_color || "#1B4332";
  const accentColor  = profile.accent_color  || "#C9A84C";
  const lightPrimary = "#2D6A4F";

  const [viewKey,      setViewKey]      = useState(todayKey());
  const [activeTab,    setActiveTab]    = useState("priorities");
  const [showArchive,  setShowArchive]  = useState(false);
  const [dayData,      setDayData]      = useState<DayData>(emptyDay());
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [saveStatus,   setSaveStatus]   = useState<"" | "saving" | "saved" | "error">("");
  const [allDates,     setAllDates]     = useState<string[]>(entryDates);

  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToday    = viewKey === todayKey();
  const readOnly   = !isToday;

  // ── Load entry when viewKey changes ───────────────────────────────────
  useEffect(() => {
    setLoadingEntry(true);
    fetch(`/api/journal?date=${viewKey}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setDayData({ ...emptyDay(), ...json.data.data });
        } else {
          setDayData(emptyDay());
        }
      })
      .catch(() => setDayData(emptyDay()))
      .finally(() => setLoadingEntry(false));
  }, [viewKey]);

  // ── Auto-save with 800ms debounce ──────────────────────────────────────
  const persistDay = useCallback((data: DayData) => {
    if (readOnly) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch("/api/journal", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ entryDate: viewKey, data }),
        });
        const json = await res.json();
        if (json.success) {
          setSaveStatus("saved");
          // Add today to archive list if not already there
          setAllDates(prev =>
            prev.includes(viewKey) ? prev : [viewKey, ...prev].sort((a, b) => b.localeCompare(a))
          );
          setTimeout(() => setSaveStatus(""), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }, [viewKey, readOnly]);

  // Update helpers — immutably update dayData and trigger save
  const updateDay = useCallback((updater: (d: DayData) => DayData) => {
    if (readOnly) return;
    setDayData(prev => {
      const next = updater(prev);
      persistDay(next);
      return next;
    });
  }, [readOnly, persistDay]);

  const setTasks   = (key: string) => (val: Task[]) => updateDay(d => ({ ...d, tasks:  { ...d.tasks,  [key]: val } }));
  const setPower   = (i: number)   => (val: string) => updateDay(d => ({ ...d, power:  { ...d.power,  [i]:   val } }));
  const setCheck   = (i: number)   => (checked: boolean) => updateDay(d => ({ ...d, checks: { ...d.checks, [i]: checked } }));
  const setField   = (f: keyof DayData) => (val: string) => updateDay(d => ({ ...d, [f]: val }));
  const setReflect = (i: number)   => (val: string) => updateDay(d => {
    const r = [...(d.reflections || ["", "", "", ""])];
    r[i] = val;
    return { ...d, reflections: r };
  });

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const scripture   = pickByDay(SCRIPTURES,    viewKey);
  const affirmation = pickByDay(AFFIRMATIONS,  viewKey);
  const habit       = pickByDay(LEADER_HABITS, viewKey);

  const archiveDays = allDates.filter(k => k !== todayKey());
  const displayName = profile.tier === "premium" && profile.org_name
    ? profile.org_name
    : (profile.full_name || "Your");

  const TABS = [
    { key: "priorities", label: "Priorities & Tasks"   },
    { key: "schedule",   label: "Day Schedule"         },
    { key: "power",      label: "Power Map"            },
    { key: "notes",      label: "Notes & Reflections"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F0", fontFamily: "'Lora',Georgia,serif",
      backgroundImage: "radial-gradient(ellipse at top left,#e8f5e9 0%,transparent 55%),radial-gradient(ellipse at bottom right,#fef9e7 0%,transparent 55%)" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        textarea { font-family: 'Lora',Georgia,serif; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulsing { animation: pulse 1.2s infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg,${primaryColor} 0%,${lightPrimary} 100%)`, padding: "24px 28px 0", borderBottom: `4px solid ${accentColor}`, boxShadow: "0 6px 30px rgba(27,67,50,0.2)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            {profile.tier === "premium" && profile.org_logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.org_logo_url} alt="Organization logo" style={{ height: 36, marginBottom: 8, objectFit: "contain" }} />
            )}
            <div style={{ color: accentColor, fontSize: 10, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              {profile.tier === "premium" && profile.org_name ? profile.org_name : "Daily Command Center"}
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "clamp(20px,4vw,28px)", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, lineHeight: 1.15 }}>
              {displayName}'s Daily Command Center
            </div>
            <div style={{ color: "#A7D5B5", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span>{formatDisplayDate(viewKey)}</span>
              {readOnly && <span style={{ background: accentColor, color: primaryColor, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>Archive View</span>}
              {saveStatus === "saving" && <span className="pulsing" style={{ color: accentColor, fontSize: 11 }}>Saving…</span>}
              {saveStatus === "saved"  && <span style={{ color: "#6EE7B7", fontSize: 11 }}>✓ Saved</span>}
              {saveStatus === "error"  && <span style={{ color: "#FCA5A5", fontSize: 11 }}>⚠ Save failed</span>}
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button onClick={() => setShowArchive(!showArchive)} style={headerBtn(showArchive, accentColor, primaryColor)}>
                {showArchive ? "◀ Close Journal" : "📖 Past Days"}
              </button>
              {profile.tier === "premium" && (
                <Link href="/settings" style={{ ...headerBtn(false, accentColor, primaryColor), textDecoration: "none" }}>⚙ Settings</Link>
              )}
              <button onClick={handleSignOut} style={{ ...headerBtn(false, accentColor, primaryColor), background: "rgba(255,255,255,0.08)" }}>Sign Out</button>
            </div>
            {isToday && (
              <div style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${accentColor}`, borderRadius: 12, padding: "10px 16px", maxWidth: 280 }}>
                <div style={{ color: accentColor, fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>LEADERSHIP HABIT OF THE DAY</div>
                <div style={{ color: "#FFFFFF", fontSize: 12, lineHeight: 1.6 }}>{habit}</div>
              </div>
            )}
          </div>
        </div>

        {/* Archive drawer */}
        {showArchive && (
          <div className="fade-in" style={{ marginTop: 16, background: "rgba(0,0,0,0.22)", borderRadius: "12px 12px 0 0", padding: "16px 20px", maxHeight: 190, overflowY: "auto" }}>
            <div style={{ color: accentColor, fontWeight: 700, fontSize: 11, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Your Journal — Flip Back Through Time</div>
            {archiveDays.length === 0 && <div style={{ color: "#A7D5B5", fontSize: 13 }}>No past entries yet. Come back tomorrow and your first archived day will be here.</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button onClick={() => { setViewKey(todayKey()); setShowArchive(false); }} style={archiveBtn(viewKey === todayKey(), accentColor, primaryColor)}>Today</button>
              {archiveDays.map(k => (
                <button key={k} onClick={() => { setViewKey(k); setShowArchive(false); }} style={archiveBtn(viewKey === k, accentColor, primaryColor)}>
                  {new Date(k + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "9px 18px", borderRadius: "12px 12px 0 0", border: "none", cursor: "pointer",
              fontFamily: "'Lora',Georgia,serif", fontWeight: activeTab === t.key ? 700 : 400, fontSize: 13,
              background: activeTab === t.key ? "#FAF7F0" : "rgba(255,255,255,0.1)",
              color: activeTab === t.key ? primaryColor : "#FFFFFF", transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── SCRIPTURE BANNER ── */}
      <div style={{ background: "linear-gradient(90deg,#F5E6C0,#fffbf0,#F5E6C0)", borderBottom: `1.5px solid ${accentColor}`, padding: "14px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 20 }}>✝️</span>
        <div>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: primaryColor, fontSize: 14, lineHeight: 1.6 }}>"{scripture.verse}"</span>
          <span style={{ display: "block", color: "#A07820", fontSize: 12, fontWeight: 700, marginTop: 2 }}>— {scripture.ref}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px 0" }} className="fade-in">

        {loadingEntry && (
          <div style={{ textAlign: "center", padding: 40, color: "#6B7280", fontSize: 14 }}>Loading your entry…</div>
        )}

        {!loadingEntry && readOnly && (
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 12, padding: "10px 16px", marginBottom: 18, fontSize: 13, color: "#92400E", fontStyle: "italic" }}>
            Viewing archive entry from {formatDisplayDate(viewKey)}. This entry is read-only.{" "}
            <button onClick={() => setViewKey(todayKey())} style={{ background: "none", border: "none", color: "#92400E", textDecoration: "underline", cursor: "pointer", fontFamily: "'Lora',Georgia,serif", fontSize: 13 }}>Return to today.</button>
          </div>
        )}

        {!loadingEntry && (
          <>
            {/* ── PRIORITIES TAB ── */}
            {activeTab === "priorities" && (
              <div>
                <SectionHeader sub="Start here every morning. Be honest. Be specific." title="What Matters Most Today" />
                <div style={{ background: `linear-gradient(90deg,${primaryColor},${lightPrimary})`, borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📬</span>
                  <div>
                    <div style={{ color: accentColor, fontWeight: 700, fontSize: 13 }}>Daily Email Triage (1:15 PM block)</div>
                    <div style={{ color: "#C8E6D0", fontSize: 11, marginTop: 2 }}>Batch delete store/sales emails. Unsubscribe from 2 senders. Draft 3 responses. Move the rest to folders.</div>
                  </div>
                </div>
                {PRIORITY_LEVELS.map(level => (
                  <TaskSection key={level.key} level={level} tasks={dayData.tasks[level.key] || []} onChange={setTasks(level.key)} readOnly={readOnly} />
                ))}
              </div>
            )}

            {/* ── SCHEDULE TAB ── */}
            {activeTab === "schedule" && (
              <div>
                <SectionHeader sub="Your day, structured with intention." title="Time Blocks" />
                {BLOCKS.map((block, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12, padding: "14px 16px", background: block.type === "break" ? "#F0FFF4" : "#F5E6C0", borderRadius: 12, borderLeft: `4px solid ${block.type === "break" ? "#6EE7B7" : accentColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <span style={{ fontSize: 22, minWidth: 30, textAlign: "center" }}>{block.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: primaryColor, fontFamily: "'Playfair Display',Georgia,serif" }}>{block.time}</div>
                      <div style={{ fontSize: 13, color: "#2D6A4F", marginTop: 2 }}>{block.label}</div>
                      {block.type === "break"   && <Note>Step away. Breathe. Water. Walk. You earn this.</Note>}
                      {block.type === "deep"    && <Note>Grant narratives, creative projects, LOIs, strategic writing. No interruptions.</Note>}
                      {block.type === "email"   && <Note>Search 2–3 new grant opportunities. Triage inbox. Unsubscribe from junk. Batch responses.</Note>}
                      {block.type === "program" && <Note>Program coordination, documentation, outstanding communications.</Note>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── POWER MAP TAB ── */}
            {activeTab === "power" && (
              <div>
                <SectionHeader sub="Reviewed monthly. Tended regularly." title="Power Map & Leadership Visibility" />
                {POWER_PROMPTS.map((item, i) => (
                  <div key={i} style={{ background: "#FFFFFF", border: "1.5px solid #E5DFC8", borderRadius: 12, padding: "14px 18px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: primaryColor, fontSize: 14 }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8, fontStyle: "italic" }}>{item.hint}</div>
                    <TA value={dayData.power[i] || ""} onChange={readOnly ? undefined : setPower(i)} placeholder="Your thoughts here…" minHeight={72} />
                  </div>
                ))}
                <div style={{ background: "#F5E6C0", border: `1.5px solid ${accentColor}`, borderRadius: 12, padding: "16px 18px", marginTop: 8 }}>
                  <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: primaryColor, fontSize: 14, marginBottom: 10 }}>Weekly Leadership Development Checklist</div>
                  {LEADERSHIP_CHECKS.map((item, i) => (
                    <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: readOnly ? "default" : "pointer" }}>
                      <input type="checkbox" checked={dayData.checks[i] || false}
                        onChange={readOnly ? undefined : e => setCheck(i)(e.target.checked)}
                        disabled={readOnly}
                        style={{ accentColor: primaryColor, marginTop: 2, width: 15, height: 15 }} />
                      <span style={{ fontSize: 13, color: primaryColor, lineHeight: 1.5 }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── NOTES TAB ── */}
            {activeTab === "notes" && (
              <div>
                <SectionHeader sub="Your inner voice deserves a page too." title="Notes, Intentions & Reflections" />
                <Card title="Morning Intention" hint="What is one thing you want to feel or accomplish by the end of today?">
                  <TA value={dayData.intention || ""} onChange={readOnly ? undefined : setField("intention")} placeholder="Set your intention for the day…" minHeight={90} />
                </Card>
                <Card title="General Notes & Brain Dump" hint="Anything on your mind that needs to get out of your head and onto paper.">
                  <TA value={dayData.brainDump || ""} onChange={readOnly ? undefined : setField("brainDump")} placeholder="Clear your mental cache here…" minHeight={140} />
                </Card>
                <div style={{ background: `linear-gradient(135deg,${primaryColor},${lightPrimary})`, borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ color: accentColor, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>End of Day Reflection (4:00 PM)</div>
                  {["What did I complete today that moves the mission forward?", "What got in the way, and what do I do differently tomorrow?", "Who did I connect with in a meaningful way?", "What is one thing I am proud of today?"].map((q, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ color: "#C8E6D0", fontSize: 12, marginBottom: 6, fontStyle: "italic" }}>{q}</div>
                      <TA value={(dayData.reflections || ["","","",""])[i] || ""} onChange={readOnly ? undefined : setReflect(i)} placeholder="…" minHeight={58} light />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── AFFIRMATION FOOTER ── */}
        <div style={{ margin: "32px 0 0", background: `linear-gradient(135deg,#0f2a1e 0%,${primaryColor} 100%)`, borderRadius: 16, padding: "24px 28px", border: `2px solid ${accentColor}`, boxShadow: `0 8px 32px rgba(27,67,50,0.3)`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: `2px solid rgba(201,168,76,0.2)`, pointerEvents: "none" }} />
          <div style={{ color: accentColor, fontSize: 10, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Today's Affirmation</div>
          <div style={{ color: "#FFFFFF", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontSize: 16, lineHeight: 1.8 }}>"{affirmation}"</div>
          <div style={{ color: "#A7D5B5", fontSize: 11, marginTop: 12, letterSpacing: 1 }}>Speak it. Believe it. Walk in it.</div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", margin: "24px 0 40px", color: "#9CA3AF", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
          Daily Command Center · Created by Michelle Burdex
          <br />
          <span style={{ color: accentColor, fontSize: 9 }}>© {new Date().getFullYear()} Michelle Burdex · All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
}

// ── Reusable UI components ─────────────────────────────────────────────────
function TaskSection({ level, tasks, onChange, readOnly }: {
  level: typeof PRIORITY_LEVELS[0];
  tasks: Task[];
  onChange: (val: Task[]) => void;
  readOnly: boolean;
}) {
  const [open, setOpen]   = useState(true);
  const [input, setInput] = useState("");
  const done = tasks.filter(t => t.done).length;

  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: level.bg, border: `1.5px solid ${level.color}`, borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 14, color: level.color }}>
        <span style={{ flex: 1, textAlign: "left" }}>{level.label}</span>
        <span style={{ fontSize: 11, opacity: 0.7 }}>{done}/{tasks.length}</span>
        <span style={{ fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ paddingLeft: 8, paddingTop: 6 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 5, borderRadius: 8, background: t.done ? "#F3F0E8" : level.bg, borderLeft: `3px solid ${level.color}`, opacity: t.done ? 0.6 : 1 }}>
              <input type="checkbox" checked={t.done} onChange={() => !readOnly && onChange(tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x))} disabled={readOnly} style={{ accentColor: level.color, width: 16, height: 16 }} />
              <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: "#1B4332" }}>{t.text}</span>
              {!readOnly && <button onClick={() => onChange(tasks.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14 }}>✕</button>}
            </div>
          ))}
          {!readOnly && (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onChange([...tasks, { text: input.trim(), done: false }]); setInput(""); }}} placeholder="Add a task…" style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${level.color}`, fontFamily: "'Lora',Georgia,serif", fontSize: 13, outline: "none", background: "#FFFFFF", color: "#1B4332" }} />
              <button onClick={() => { if (input.trim()) { onChange([...tasks, { text: input.trim(), done: false }]); setInput(""); }}} style={{ padding: "7px 14px", borderRadius: 8, background: level.color, color: "#FFFFFF", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TA({ value, onChange, placeholder, minHeight = 80, light }: { value: string; onChange?: (v: string) => void; placeholder?: string; minHeight?: number; light?: boolean; }) {
  return (
    <textarea value={value} onChange={e => onChange?.(e.target.value)} readOnly={!onChange} placeholder={placeholder}
      style={{ width: "100%", minHeight, padding: "10px 12px", border: `1.5px solid ${light ? "rgba(201,168,76,0.4)" : "#C9A84C"}`, borderRadius: 8, fontSize: 13, color: light ? "#FFFFFF" : "#1B4332", background: light ? "rgba(255,255,255,0.08)" : "#FAF7F0", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
  );
}

function SectionHeader({ sub, title }: { sub: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{sub}</div>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, color: "#1B4332", fontWeight: 700 }}>{title}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3, fontStyle: "italic" }}>{children}</div>;
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, border: "1.5px solid #E5DFC8" }}>
      <div style={{ fontWeight: 700, color: "#1B4332", fontSize: 14, marginBottom: 6, fontFamily: "'Playfair Display',Georgia,serif" }}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8, fontStyle: "italic" }}>{hint}</div>}
      {children}
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────────
function headerBtn(active: boolean, accent: string, primary: string): React.CSSProperties {
  return {
    background:  active ? accent : "rgba(255,255,255,0.12)",
    color:       active ? primary : "#FFFFFF",
    border:      `1px solid ${accent}`,
    borderRadius: 20,
    padding:     "7px 14px",
    cursor:      "pointer",
    fontFamily:  "'Lora',Georgia,serif",
    fontWeight:  700,
    fontSize:    12,
  };
}

function archiveBtn(active: boolean, accent: string, primary: string): React.CSSProperties {
  return {
    padding:     "7px 14px",
    borderRadius: 20,
    cursor:      "pointer",
    fontFamily:  "'Lora',Georgia,serif",
    fontSize:    12,
    background:  active ? accent : "rgba(255,255,255,0.1)",
    color:       active ? primary : "#FFFFFF",
    border:      `1px solid ${accent}`,
    fontWeight:  active ? 700 : 400,
  };
}
