import React from "react";
import { 
  Activity, 
  Cpu, 
  Wrench, 
  FileWarning, 
  MessageSquare, 
  BookOpen, 
  HardDrive
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, alertsCount }) {
  const menuItems = [
    { id: "command", label: "Operations Center", icon: Activity, description: "Digital Twin & Briefing" },
    { id: "pipeline", label: "Intelligence Pipeline", icon: Cpu, description: "Industrial Memory Graph" },
    { id: "maintenance", label: "Prognostics & RUL", icon: Wrench, description: "Degradation Modeling" },
    { id: "lessons", label: "Lessons Learned", icon: FileWarning, description: "Causal Failure Matcher" },
    { id: "copilot", label: "Decision Copilot", icon: MessageSquare, description: "Multi-Turn RAG Memory" },
    { id: "technical", label: "Technical Defense", icon: BookOpen, description: "Ontological Architecture" },
  ];

  return (
    <aside className="glass-panel" style={{
      width: "290px",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      position: "sticky",
      top: 0,
      zIndex: 10,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="pulse-glow-cyan" style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-cyan)"
          }} />
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            letterSpacing: "0.05em",
            background: "linear-gradient(135deg, #3DD9EB, #4F8CFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>AURA</h1>
        </div>
        <span style={{
          fontSize: "0.62rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: "600"
        }}>Autonomous Industrial OS</span>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Navigation Options */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: isActive ? "rgba(61, 217, 235, 0.08)" : "transparent",
                color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                width: "100%",
                borderLeft: isActive ? "3px solid var(--accent-cyan)" : "3px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{item.label}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{item.description}</span>
              </div>
              
              {item.id === "lessons" && alertsCount > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: "var(--accent-crimson)",
                  color: "#fff",
                  fontSize: "0.65rem",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontWeight: "700"
                }}>
                  {alertsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="elevated-panel" style={{
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>System Safety:</span>
          <span className="status-badge healthy" style={{ fontSize: "0.65rem" }}>ONLINE</span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)" }}>
            <span>Active Memory Nodes</span>
            <span>28</span>
          </div>
          <div style={{
            height: "4px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "2px",
            overflow: "hidden"
          }}>
            <div style={{
              width: "82%",
              height: "100%",
              background: "linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))"
            }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
