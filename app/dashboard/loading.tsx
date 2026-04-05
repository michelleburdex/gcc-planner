export default function DashboardLoading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Lora',Georgia,serif",
    }}>
      <div style={{ color: "#C9A84C", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
        Daily Command Center
      </div>
      <div style={{ color: "#FFFFFF", fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 900, marginBottom: 24 }}>
        Loading your planner…
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#C9A84C",
            animation: `bounce 1s ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity:0.4; }
          50%      { transform: translateY(-8px); opacity:1; }
        }
      `}</style>
    </div>
  );
}
