import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ThumbsUp, 
  ThumbsDown, 
  Info,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

// Reusable Animated Counter component
function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = parseFloat(value) || 0;

  useEffect(() => {
    let start = 0;
    const end = numValue;
    const duration = 700; // ms
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = start + easeProgress * (end - start);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    }

    requestAnimationFrame(animate);
  }, [numValue]);

  const formatted = numValue % 1 === 0 ? Math.round(displayValue) : displayValue.toFixed(1);
  return <span>{prefix}{formatted}{suffix}</span>;
}

export default function ExecutiveCommand({ 
  assets, 
  onSelectAsset, 
  feedbackRatio, 
  setFeedbackRatio, 
  ingestedDocs 
}) {
  const [selectedNode, setSelectedNode] = useState("P-102");
  const [hasVoted, setHasVoted] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  
  // Live timestamp tracking
  const [lastUpdatedText, setLastUpdatedText] = useState("15 Jul 2026 22:30:12 IST");
  const [showToast, setShowToast] = useState(false);

  const activeAsset = assets[selectedNode];
  const totalGaps = Object.values(assets).filter(a => a.status === "Warning").length;

  const p102Vib = assets["P-102"].telemetry.vibration;
  const wearRate = 0.35;
  const thresholdVib = 8.5;
  const calculatedRUL = p102Vib > 4.5 ? ((thresholdVib - p102Vib) / wearRate).toFixed(1) : 34.0;

  const isHealthy = activeAsset.status === "Healthy";
  const isWarning = activeAsset.status === "Warning";
  const isCritical = activeAsset.status === "Critical";

  // Trigger "Just now" and toast alerts on telemetry updates
  useEffect(() => {
    setLastUpdatedText("Just now");
    
    // Resume standard timestamp formatting after 4 seconds
    const interval = setTimeout(() => {
      const now = new Date();
      setLastUpdatedText(`${now.getDate()} Jul 2026 ${now.toLocaleTimeString()} IST`);
    }, 4000);

    // If P-102 is in Warning or Critical state, show the executive alert toast
    if (p102Vib > 4.5) {
      setShowToast(true);
    }

    return () => clearTimeout(interval);
  }, [p102Vib]);

  const handleVote = (vote) => {
    setHasVoted(vote);
    if (vote === "up") {
      setFeedbackRatio(prev => Math.min(1.0, prev + 0.02));
    } else {
      setFeedbackRatio(prev => Math.max(0.8, prev - 0.05));
    }
  };

  // Logic-driven values depending on node health state
  let rawDowntime = 0.0;
  let rawLoss = 0.0;
  let recommendation = "";
  let confidenceScore = 93.0;

  if (selectedNode === "P-102") {
    if (isHealthy) {
      rawDowntime = 0.0;
      rawLoss = 0.0;
      recommendation = "No preemptive action required. Telemetry parameters operate within nominal thresholds.";
      confidenceScore = 98.2;
    } else if (isWarning) {
      rawDowntime = 4.0;
      rawLoss = 2.8;
      recommendation = "Schedule bearing gasket replacement during low-load window tonight. Telemetry indicates vibration thresholds breached.";
      confidenceScore = 93.0;
    } else {
      rawDowntime = 8.0;
      rawLoss = 5.6;
      recommendation = "CRITICAL: Trigger immediate bypass routing to Aux Pump P-108. Dispatch maintenance engineer for emergency seal replacement.";
      confidenceScore = 91.5;
    }
  } else if (selectedNode === "V-15") {
    if (isHealthy) {
      rawDowntime = 0.0;
      rawLoss = 0.0;
      recommendation = "Nominal operations. Relief valve certificates are active and valid.";
      confidenceScore = 97.5;
    } else {
      rawDowntime = 1.5;
      rawLoss = 0.9;
      recommendation = "Schedule hydrostatic testing and safety recertification. Close the PESO-2025 compliance gap nearby.";
      confidenceScore = 89.2;
    }
  } else {
    rawDowntime = 0.0;
    rawLoss = 0.0;
    recommendation = "Nominal operations. Device logs confirm parameters conform to SOP margins.";
    confidenceScore = 98.5;
  }

  // Get dynamic emoji indicator for pills (Refinement 2)
  const getStatusPill = (status) => {
    if (status === "Healthy") return <span className="status-badge healthy">🟢 Healthy</span>;
    if (status === "Warning") return <span className="status-badge warning">🟡 Warning</span>;
    if (status === "Critical") return <span className="status-badge critical">🔴 Critical</span>;
    return <span className="status-badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>⚪ Offline</span>;
  };

  // Render inline confidence gauge blocks (Refinement 8)
  const getConfidenceGauge = (val) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((val / 100) * totalBlocks);
    const gauge = "█".repeat(filledBlocks) + "░".repeat(totalBlocks - filledBlocks);
    return (
      <span style={{ fontFamily: "JetBrains Mono", color: "var(--accent-cyan)", marginRight: "8px" }}>
        {gauge}
      </span>
    );
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", position: "relative" }}>
      
      {/* Executive Alert Toast (Refinement 9) */}
      {showToast && (
        <div className="fade-in" style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          width: "320px",
          zIndex: 999,
          background: "rgba(22, 30, 46, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid var(--accent-crimson)",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--accent-crimson)", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={14} /> CRITICAL ASSET DETECTED
            </span>
            <button 
              onClick={() => setShowToast(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem" }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Feed Pump P-102 Alert</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Vibration level at {p102Vib} mm/s. Predicted failure in <strong>{calculatedRUL} Days</strong>.
          </div>
          <button 
            onClick={() => { setSelectedNode("P-102"); setShowToast(false); }}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fb7185",
              borderRadius: "6px",
              padding: "6px",
              fontSize: "0.72rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
          >
            Inspect Asset <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Top Walkthrough Scenario Bar */}
      <div style={{
        background: "rgba(0, 242, 254, 0.04)",
        border: "1px solid rgba(0, 242, 254, 0.12)",
        padding: "12px 20px",
        borderRadius: "16px",
        fontSize: "0.78rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px"
      }}>
        <span>
          <strong style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
            color: "#080B12",
            padding: "2px 6px",
            borderRadius: "4px",
            marginRight: "8px",
            fontWeight: "700"
          }}>DEMO STORY</strong>
          1. Go to <strong>Intelligence Pipeline</strong> $\rightarrow$ 
          2. Select <code>Checklist_Pump_P102_Log.csv</code> $\rightarrow$ 
          3. Return here to observe P-102 transition, RUL drop, and the explainability evidence checkboxes check themselves.
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "JetBrains Mono" }}>
          Last Updated: {lastUpdatedText}
        </span>
      </div>

      {/* Main Grid: Twin & Specs */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px" }}>
        
        {/* Plant Digital Twin */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)" }}>Plant Digital Twin Topology</h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>Select node to project operational metrics and check decision guidelines.</p>
            </div>
            {getStatusPill(assets[selectedNode].status)}
          </div>

          <div style={{
            background: "rgba(4, 6, 10, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            position: "relative"
          }}>
            <svg width="100%" height="280" viewBox="0 0 600 280" style={{ overflow: "visible" }}>
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none">
                <path d="M 120 140 L 220 70" stroke={selectedNode === "B-201" || selectedNode === "V-15" ? "rgba(0, 242, 254, 0.3)" : "rgba(255,255,255,0.06)"} />
                <path d="M 120 210 L 220 70" stroke={selectedNode === "C-302" || selectedNode === "V-15" ? "rgba(0, 242, 254, 0.3)" : "rgba(255,255,255,0.06)"} />
                <path d="M 220 70 L 320 140" />
                <path d="M 440 140 L 520 140" stroke={selectedNode === "P-102" || selectedNode === "M-105" ? "rgba(0, 242, 254, 0.3)" : "rgba(255,255,255,0.06)"} />
                <path d="M 320 210 L 440 140" />
                <path d="M 320 140 L 320 210" />
              </g>

              {/* Animated pipeline particle */}
              <circle r="4.5" fill="var(--accent-cyan)">
                <animateMotion dur="5s" repeatCount="indefinite" path="M 120 140 L 220 70 L 320 140 L 320 210 L 440 140 L 520 140" />
              </circle>

              {[
                { id: "B-201", x: 120, y: 140, label: "Boiler B-201" },
                { id: "C-302", x: 120, y: 210, label: "Compressor C-302" },
                { id: "V-15", x: 220, y: 70, label: "Safety Valve V-15" },
                { id: "V-12", x: 320, y: 210, label: "Control Valve V-12" },
                { id: "P-102", x: 440, y: 140, label: "Feed Pump P-102" },
                { id: "M-105", x: 520, y: 140, label: "Motor M-105" }
              ].map(node => {
                const state = assets[node.id];
                const isSelected = selectedNode === node.id;
                
                let color = "#22C55E"; // Green
                if (state.status === "Warning") color = "#FBBF24"; // Yellow
                else if (state.status === "Critical") color = "#EF4444"; // Red

                return (
                  <g 
                    key={node.id} 
                    onClick={() => {
                      setSelectedNode(node.id);
                      onSelectAsset(node.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {isSelected && (
                      <circle cx={node.x} cy={node.y} r="22" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3">
                        <animateTransform attributeName="transform" type="rotate" from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={node.x} cy={node.y} r="12" fill="rgba(0,0,0,0.5)" stroke={color} strokeWidth="2" />
                    <circle cx={node.x} cy={node.y} r="6" fill={color} />
                    <text x={node.x} y={node.y + 30} textAnchor="middle" fill={isSelected ? "var(--accent-cyan)" : "var(--text-primary)"} fontSize="0.75rem" fontWeight={isSelected ? "600" : "500"}>
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Spec Sheet & Telemetry list */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-cyan)", fontWeight: "700" }}>Asset Spec Sheet</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{activeAsset.name}</h3>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Type: {activeAsset.type} | Room: {activeAsset.location}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-secondary)" }}>Sensor Telemetry</span>
              {Object.entries(activeAsset.telemetry).map(([key, val]) => {
                const limit = activeAsset.limits[key] || 100;
                const ratio = Math.min(100, (val / limit) * 100);
                let barColor = "var(--accent-cyan)";
                let trendIcon = "📈"; // Mini Sparkline indicator (Refinement 5)
                
                if (key === "vibration") {
                  if (val > 4.5) barColor = "var(--accent-crimson)";
                  else trendIcon = "📉";
                }
                if (key === "temperature" && val > 65) barColor = "var(--accent-orange)";
                if (key === "lubrication" && val < 60) {
                  barColor = "var(--accent-orange)";
                  trendIcon = "📉";
                }

                return (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                      <span style={{ textTransform: "capitalize" }}>{key}</span>
                      <span style={{ fontFamily: "JetBrains Mono" }}>
                        {val} / {limit} <span style={{ fontSize: "0.6rem", marginLeft: "4px" }}>{trendIcon}</span>
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${ratio}%`, height: "100%", background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />

            {/* RUL math details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Calculated RUL Margin</span>
                  <p style={{ fontSize: "1.05rem", fontWeight: "700", color: activeAsset.status !== "Healthy" ? "var(--accent-orange)" : "var(--accent-cyan)" }}>
                    {selectedNode === "P-102" ? (
                      <AnimatedCounter value={calculatedRUL} suffix=" Days" />
                    ) : (
                      <AnimatedCounter value="34.0" suffix=" Days" />
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => setShowFormula(!showFormula)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "var(--accent-cyan)",
                    padding: "4px 8px",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {showFormula ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Math Logic
                </button>
              </div>

              {showFormula && (
                <div className="fade-in" style={{
                  background: "rgba(4,6,10,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  padding: "10px",
                  fontFamily: "JetBrains Mono",
                  fontSize: "0.65rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.4"
                }}>
                  <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>Prognostics Formula:</div>
                  <code>RUL = (Threshold - Current) / wearRate</code>
                  <div style={{ marginTop: "6px" }}>
                    • Limit Threshold: {selectedNode === "P-102" ? `${thresholdVib} mm/s` : `${activeAsset.limits.vibration || 5.0} mm/s`}
                    <br />
                    • Current Value: {selectedNode === "P-102" ? `${p102Vib} mm/s` : `${activeAsset.telemetry.vibration} mm/s`}
                    <br />
                    • Wear Rate: {selectedNode === "P-102" ? `${wearRate} mm/s/day` : "0.10  mm/s/day"}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Decision Support & Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "20px" }}>
        
        {/* Explainability Decision Card */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={16} style={{ color: "var(--accent-cyan)" }} />
            <span>Decision Coordinator Summary</span>
          </h3>

          {/* Downtime & Production loss animated counters (Refinement 1) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} style={{ color: "var(--accent-cyan)" }} />
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Est. Downtime</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "JetBrains Mono" }}>
                  <AnimatedCounter value={rawDowntime} suffix=" Hours" />
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <DollarSign size={16} style={{ color: "var(--accent-orange)" }} />
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Production Loss</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "JetBrains Mono" }}>
                  <AnimatedCounter value={rawLoss} prefix="₹" suffix=" Lakhs" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-secondary)" }}>Action Recommendation</span>
            <div style={{
              background: "rgba(0, 242, 254, 0.03)",
              border: "1px solid rgba(0, 242, 254, 0.08)",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              lineHeight: "1.3"
            }}>
              <div>
                <strong>{isHealthy ? "System Normal:" : "Preemptive Safety Recommendation:"}</strong> {recommendation}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--accent-cyan)" }}>Source Evidence Trace:</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem" }}>
                    <CheckSquare size={10} style={{ color: isHealthy ? "rgba(255,255,255,0.15)" : "var(--accent-emerald)" }} /> 
                    Vibration Telemetry Limit: {thresholdVib} mm/s (Current: {p102Vib} mm/s)
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem" }}>
                    <CheckSquare size={10} style={{ color: isHealthy ? "rgba(255,255,255,0.15)" : "var(--accent-emerald)" }} /> 
                    Historical Correlation Match: {isHealthy ? "No failure overlaps found" : "Matches Incident #48 (94% context)"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem" }}>
                    <CheckSquare size={10} style={{ color: isHealthy ? "rgba(255,255,255,0.15)" : "var(--accent-emerald)" }} /> 
                    Plant Guidelines compliance: {isHealthy ? "Conforms to SOP-44 startup boundaries" : "SOP-44 / OISD-STD-189 boundary checks trigger"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback loop & Confidence Block Visual (Refinement 8) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem" }}>
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
              {getConfidenceGauge(confidenceScore)}
              <span>Confidence: <strong style={{ color: "var(--accent-cyan)", fontFamily: "JetBrains Mono" }}>{(confidenceScore * feedbackRatio).toFixed(1)}%</strong></span>
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button 
                onClick={() => handleVote("up")}
                disabled={hasVoted !== null}
                className="glow-button"
                style={{
                  background: hasVoted === "up" ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.03)",
                  borderColor: hasVoted === "up" ? "var(--accent-emerald)" : "rgba(255,255,255,0.08)",
                  color: hasVoted === "up" ? "#34d399" : "var(--text-secondary)",
                  padding: "4px 8px",
                  fontSize: "0.65rem"
                }}
              >
                <ThumbsUp size={10} /> Correct
              </button>
              <button 
                onClick={() => handleVote("down")}
                disabled={hasVoted !== null}
                className="glow-button"
                style={{
                  background: hasVoted === "down" ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.03)",
                  borderColor: hasVoted === "down" ? "var(--accent-crimson)" : "rgba(255,255,255,0.08)",
                  color: hasVoted === "down" ? "#fb7185" : "var(--text-secondary)",
                  padding: "4px 8px",
                  fontSize: "0.65rem"
                }}
              >
                <ThumbsDown size={10} /> Incorrect
              </button>
            </div>
          </div>
        </div>

        {/* Empty States Check (Refinement 10) */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={16} style={{ color: "var(--accent-cyan)" }} />
            <span>Industrial Operating Index</span>
          </h3>

          {totalGaps === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexGrow: 1,
              color: "var(--accent-emerald)",
              fontSize: "0.8rem",
              padding: "24px 0",
              textAlign: "center"
            }}>
              <CheckSquare size={24} />
              <div>
                <strong>✓ No critical incidents.</strong>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2px" }}>Plant is operating normally.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Document Intelligence Indexing:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>45 min</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "600", fontFamily: "JetBrains Mono" }}>2 min</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Incident RCA Correlation Time:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>2 hrs</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "600", fontFamily: "JetBrains Mono" }}>18 min</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Compliance Package Compilation:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>4 hrs</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "600", fontFamily: "JetBrains Mono" }}>35 sec</span>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "2px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>System Downtime Mitigation:</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>-20% Reduction</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
