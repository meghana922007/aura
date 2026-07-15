import React, { useState } from "react";
import { 
  FileWarning, 
  GitCompare, 
  AlertOctagon, 
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { findSimilarIncidents } from "../utils/engine";
import { historicalIncidents } from "../data/initialData";

export default function LessonsLearned() {
  const [inputText, setInputText] = useState(
    "High vibration recorded during startup of feed water Pump P-102. Vibration rate of change is abnormal. Seal leak reported, pressure fluctuations hit 17.5 bar. Thermal wear has accelerated bearing deterioration, resulting in steam venting."
  );

  const presets = [
    {
      title: "Boiler Feed Valve pulsing leak",
      text: "Boiler Feed Pump V-12 control valve has pressure leakage. Dynamic fluids caused pulsation in lines. Seal failure occurred on high temperature steam, tripping pump P-102."
    },
    {
      title: "Compressor friction shutdown",
      text: "Bearing temperature high in compressor C-302, tripped automatically. Post inspection reports carbon sludge deposits and high synthetic oil viscosity oxidation."
    },
    {
      title: "Monsoon electrical breakdown",
      text: "High stator temperature inside motor M-105 winding casing, drawing 24A current. Heavy monsoon humidity caused moisture accumulation and dielectric breakdown."
    }
  ];

  const handlePresetSelect = (presetText) => {
    setInputText(presetText);
  };

  const matches = findSimilarIncidents(inputText, historicalIncidents);

  // Helper to generate text overlap explanation reasons dynamically based on keyword matching
  const getMatchReasons = (inputText, inc) => {
    const textLower = inputText.toLowerCase();
    const incText = `${inc.title} ${inc.description} ${inc.rootCause} ${inc.preventiveAction}`.toLowerCase();
    const reasons = [];

    const keywords = [
      { key: "valve", label: "Valve fatigue / alignment matching" },
      { key: "seal", label: "Gasket seal / elastomer wear" },
      { key: "puls", label: "Dynamic fluid pulsing / surge" },
      { key: "vibrat", label: "Abnormal vibration spikes" },
      { key: "lubricat", label: "Lubricant sludge / oil oxidation" },
      { key: "temperat", label: "Bearing core thermal overload" },
      { key: "insulat", label: "Dielectric insulation breakdown" },
      { key: "moistur", label: "Moisture / stator casing ingress" }
    ];

    keywords.forEach(item => {
      if (textLower.includes(item.key) && incText.includes(item.key)) {
        reasons.push(item.label);
      }
    });

    // Fallback default
    if (reasons.length === 0) {
      reasons.push("Overlapping industrial parameter keywords");
    }

    return reasons;
  };

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%" }}>
      
      {/* Left Input */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileWarning size={18} style={{ color: "var(--accent-cyan)" }} />
            <span>Lessons Learned Engine</span>
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Causal failure matcher. Select an operational preset or input text to correlate incident reports.
          </p>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset.text)}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "6px 12px",
                borderRadius: "20px",
                color: "var(--text-secondary)",
                fontSize: "0.7rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Input Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>
            Incident Telemetry / Checksheet Findings:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              width: "100%",
              height: "150px",
              background: "#04060a",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              padding: "12px",
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.85rem",
              lineHeight: "1.4",
              resize: "none",
              outline: "none"
            }}
            placeholder="Type incident findings..."
          />
        </div>

        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <RefreshCw size={12} className="pulse-glow-cyan" />
          <span>Real-time correlation matches inputs against historical risk patterns on the blackboard.</span>
        </div>
      </div>

      {/* Right Matches */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <GitCompare size={18} style={{ color: "var(--accent-cyan)" }} />
            <span>AI Causal Correlation Ledger</span>
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Correlated failure files containing matching ontological components.
          </p>
        </div>

        {matches.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {matches.map((match) => {
              const scorePct = Math.round(match.similarityScore * 100);
              const reasons = getMatchReasons(inputText, match);
              
              let matchColor = "var(--accent-cyan)";
              if (scorePct > 80) matchColor = "var(--accent-crimson)";
              else if (scorePct > 50) matchColor = "var(--accent-amber)";

              return (
                <div 
                  key={match.id} 
                  className="glass-panel" 
                  style={{
                    padding: "16px",
                    background: "rgba(255,255,255,0.01)",
                    borderLeft: `3px solid ${matchColor}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>{match.id}</span>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>{match.title}</h4>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: matchColor, fontWeight: "700", textTransform: "uppercase" }}>
                      {scorePct > 80 ? "Critical Match" : "Moderate Correlation"}
                    </span>
                  </div>

                  {/* Dynamic overlap evidence checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.75rem" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", fontWeight: "600" }}>Matched Causal Signatures:</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", margin: "2px 0" }}>
                      {reasons.map((r, ri) => (
                        <span key={ri} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          <CheckCircle2 size={10} style={{ color: "var(--accent-emerald)" }} /> {r}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: "4px" }}>
                      <strong style={{ color: "var(--text-secondary)" }}>Root Cause:</strong>
                      <p style={{ color: "var(--text-muted)", marginTop: "2px" }}>{match.rootCause}</p>
                    </div>
                    
                    <div style={{ marginTop: "6px" }}>
                      <strong style={{ color: "var(--accent-emerald)" }}>Preventive Action Protocol:</strong>
                      <p style={{ color: "var(--text-secondary)", marginTop: "2px", background: "rgba(16, 185, 129, 0.03)", padding: "6px", border: "1px solid rgba(16, 185, 129, 0.08)", borderRadius: "4px" }}>
                        {match.preventiveAction}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", marginTop: "4px" }}>
                    <span>Affected Equipment:</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {match.affectedEquipment.map(eq => (
                        <span key={eq} style={{
                          background: "rgba(0, 242, 254, 0.06)",
                          border: "1px solid rgba(0, 242, 254, 0.15)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "var(--accent-cyan)",
                          fontFamily: "JetBrains Mono",
                          fontSize: "0.65rem"
                        }}>
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "40px 0", color: "var(--text-muted)", textAlign: "center" }}>
            <AlertOctagon size={32} />
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>No Causal Correlations Found</div>
              <span style={{ fontSize: "0.7rem" }}>Please enrich checksheets with physical attributes.</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
