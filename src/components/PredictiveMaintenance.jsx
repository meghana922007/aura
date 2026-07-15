import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Settings, 
  Activity, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  Heart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { calculateRUL } from "../utils/engine";

export default function PredictiveMaintenance({ assets, activeAssetId, onUpdateAssetTelemetry }) {
  const assetId = activeAssetId || "P-102";
  const asset = assets[assetId];
  
  // Local state for interactive sliders
  const [vibration, setVibration] = useState(asset.telemetry.vibration);
  const [vibRate, setVibRate] = useState(0.25); // mm/s per day
  const [temperature, setTemperature] = useState(asset.telemetry.temperature);
  const [tempRate, setTempRate] = useState(0.8); // C per day
  const [lubrication, setLubrication] = useState(asset.telemetry.lubrication);
  const [showFormula, setShowFormula] = useState(false);

  // Sync state if activeAssetId changes
  useEffect(() => {
    setVibration(asset.telemetry.vibration);
    setTemperature(asset.telemetry.temperature);
    setLubrication(asset.telemetry.lubrication);
  }, [assetId, asset]);

  // Recalculate RUL dynamically
  const criticalVib = asset.limits.vibration || 8.5;
  const criticalTemp = asset.limits.temperature || 85;

  const rulVib = calculateRUL(vibration, criticalVib, vibRate);
  const rulTemp = calculateRUL(temperature, criticalTemp, tempRate);
  
  const minRUL = Math.min(rulVib, rulTemp);
  const finalRUL = minRUL <= 0 ? 0 : minRUL;
  
  const riskScore = Math.min(100, Math.max(10, Math.round((1 - finalRUL / 30) * 100)));

  // Write updates back to parent state on slider change
  const handleVibrationChange = (e) => {
    const val = parseFloat(e.target.value);
    setVibration(val);
    onUpdateAssetTelemetry(assetId, { vibration: val, riskScore });
  };

  const handleTempChange = (e) => {
    const val = parseFloat(e.target.value);
    setTemperature(val);
    onUpdateAssetTelemetry(assetId, { temperature: val, riskScore });
  };

  const handleLubricationChange = (e) => {
    const val = parseInt(e.target.value);
    setLubrication(val);
    onUpdateAssetTelemetry(assetId, { lubrication: val, riskScore });
  };

  // SVG Chart rendering points
  const chartWidth = 500;
  const chartHeight = 180;
  const maxDays = 30;

  // Map day X and sensor value Y to SVG coordinates
  const getCoords = (day, val, maxVal) => {
    const x = (day / maxDays) * (chartWidth - 80) + 40;
    const y = chartHeight - 30 - (val / maxVal) * (chartHeight - 60);
    return { x, y };
  };

  const maxChartVal = Math.max(criticalVib * 1.2, vibration * 1.1);
  const points = [];
  
  // Historical data (past 5 days)
  for (let d = -5; d <= 0; d++) {
    const val = vibration - (d * 0.05); // slight historical noise
    points.push({ day: d + 5, val, isForecast: false });
  }

  // Forecast data (future 30 days or until limit hit)
  let currentForecast = vibration;
  let hitLimitDay = -1;
  
  for (let d = 1; d <= 25; d++) {
    currentForecast += vibRate;
    if (currentForecast >= criticalVib && hitLimitDay === -1) {
      hitLimitDay = d;
    }
    points.push({ day: d + 5, val: Math.min(maxChartVal, currentForecast), isForecast: true });
  }

  // Build SVG Path
  let pathD = "";
  let forecastPathD = "";

  points.forEach((pt, i) => {
    const { x, y } = getCoords(pt.day, pt.val, maxChartVal);
    if (i === 0) {
      pathD = `M ${x} ${y}`;
    } else if (pt.isForecast) {
      if (forecastPathD === "") {
        // connect to last historical point
        const lastPt = points[i - 1];
        const lastCoords = getCoords(lastPt.day, lastPt.val, maxChartVal);
        forecastPathD = `M ${lastCoords.x} ${lastCoords.y} L ${x} ${y}`;
      } else {
        forecastPathD += ` L ${x} ${y}`;
      }
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  const limitLineCoords = getCoords(0, criticalVib, maxChartVal);
  const limitLineY = limitLineCoords.y;

  // Status badge with emojis
  const getRiskPill = (score) => {
    if (score < 40) return <span className="status-badge healthy">🟢 Low Risk</span>;
    if (score < 70) return <span className="status-badge warning">🟡 Elevated Risk</span>;
    return <span className="status-badge critical">🔴 Critical Risk</span>;
  };

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", width: "100%" }}>
      
      {/* Left: Interactive Telemetry & Degradation Sliders */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings size={18} style={{ color: "var(--accent-cyan)" }} />
            <span>Parameters Degradation Simulator</span>
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Adjust physical sensors to test AURA's browser prognostics.
          </p>
        </div>

        {/* Sliders Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Vibration Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: "600" }}>Current Vibration Telemetry</span>
              <span style={{ fontFamily: "JetBrains Mono", color: vibration > 4.5 ? "var(--accent-crimson)" : "var(--accent-cyan)" }}>
                {vibration.toFixed(2)} mm/s
              </span>
            </div>
            <input 
              type="range" 
              min={1.5} 
              max={8.5} 
              step={0.1}
              value={vibration}
              onChange={handleVibrationChange}
              className="aura-slider"
            />
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>Safety Warning Limit: {criticalVib} mm/s</span>
          </div>

          {/* Vibration Degradation Rate Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: "600" }}>Vibration Degradation Rate</span>
              <span style={{ fontFamily: "JetBrains Mono", color: "var(--accent-cyan)" }}>
                +{vibRate.toFixed(2)} mm/s/day
              </span>
            </div>
            <input 
              type="range" 
              min={0.05} 
              max={0.60} 
              step={0.01}
              value={vibRate}
              onChange={(e) => setVibRate(parseFloat(e.target.value))}
              className="aura-slider"
            />
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>Extrapolates remaining useful life slope</span>
          </div>

          {/* Bearing Temperature Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: "600" }}>Bearing Core Temperature</span>
              <span style={{ fontFamily: "JetBrains Mono", color: temperature > 70 ? "var(--accent-crimson)" : "var(--accent-cyan)" }}>
                {temperature.toFixed(1)} °C
              </span>
            </div>
            <input 
              type="range" 
              min={40} 
              max={85} 
              step={1}
              value={temperature}
              onChange={handleTempChange}
              className="aura-slider"
            />
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>Safety Warning Limit: {criticalTemp} °C</span>
          </div>

          {/* Oil Lubrication Level Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: "600" }}>Lubricant Viscosity / Health</span>
              <span style={{ fontFamily: "JetBrains Mono", color: lubrication < 60 ? "var(--accent-orange)" : "var(--accent-emerald)" }}>
                {lubrication}%
              </span>
            </div>
            <input 
              type="range" 
              min={10} 
              max={100} 
              step={1}
              value={lubrication}
              onChange={handleLubricationChange}
              className="aura-slider"
            />
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>Affects wear and friction coefficients</span>
          </div>

        </div>

      </div>

      {/* Right: Mathematical Prognostics & Dynamic SVGraph */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Prognostic Output Indicators */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", position: "relative" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Remaining Useful Life (RUL)</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "2rem", fontWeight: "700", color: finalRUL < 10 ? "var(--accent-crimson)" : finalRUL < 20 ? "var(--accent-orange)" : "var(--accent-cyan)" }}>
                {finalRUL.toFixed(1)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Days</span>
            </div>
            <Clock size={16} style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-secondary)" }} />
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", position: "relative" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Calculated Risk Index</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <span style={{ fontSize: "2rem", fontWeight: "700", color: riskScore > 70 ? "var(--accent-crimson)" : riskScore > 40 ? "var(--accent-orange)" : "var(--accent-emerald)" }}>
                {riskScore}%
              </span>
              {getRiskPill(riskScore)}
            </div>
            <Heart size={16} style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-secondary)" }} />
          </div>

        </div>

        {/* Math Details button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={() => setShowFormula(!showFormula)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              color: "var(--accent-cyan)",
              padding: "6px 12px",
              fontSize: "0.7rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {showFormula ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Math Logic Explanation
          </button>
        </div>

        {showFormula && (
          <div className="fade-in" style={{
            background: "rgba(4,6,10,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "JetBrains Mono",
            fontSize: "0.68rem",
            color: "var(--text-secondary)",
            lineHeight: "1.5"
          }}>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>Prognostics Calculation:</div>
            <code>RUL = (Threshold - Current) / wearRate</code>
            <div style={{ marginTop: "6px" }}>
              • Limit Threshold: {criticalVib} mm/s (Vibration)
              <br />
              • Current Value: {vibration.toFixed(2)} mm/s
              <br />
              • Wear Degradation Slope: {vibRate.toFixed(2)} mm/s/day
            </div>
            <div style={{ marginTop: "6px", color: "var(--accent-cyan)" }}>
              Calculated RUL Margin: ({criticalVib} - {vibration.toFixed(2)}) / {vibRate.toFixed(2)} = {finalRUL.toFixed(1)} Days
            </div>
          </div>
        )}

        {/* Dynamic Degradation Forecast Chart */}
        <div style={{
          background: "#04060a",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "12px",
          position: "relative"
        }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", position: "absolute", top: "8px", left: "8px", fontWeight: "600" }}>
            Vibration Trend & Prognostics Forecast (30 Day Window)
          </span>

          <svg width="100%" height={chartHeight} style={{ overflow: "visible" }}>
            {/* Limit Line */}
            <line 
              x1={40} 
              y1={limitLineY} 
              x2={chartWidth - 40} 
              y2={limitLineY} 
              stroke="var(--accent-crimson)" 
              strokeWidth="1.5" 
              strokeDasharray="4" 
            />
            <text x={chartWidth - 110} y={limitLineY - 6} fill="var(--accent-crimson)" fontSize="8">
              Trip Limit: {criticalVib} mm/s
            </text>

            {/* Grid Y Axis text */}
            <text x={10} y={chartHeight - 30} fill="var(--text-muted)" fontSize="8">0</text>
            <text x={10} y={limitLineY} fill="var(--text-muted)" fontSize="8">{criticalVib}</text>

            {/* Ingestion Points Lines */}
            <path d={pathD} fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" />
            <path d={forecastPathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="3" />

            {/* Intersection Node */}
            {hitLimitDay !== -1 && (
              (() => {
                const intersectCoords = getCoords(hitLimitDay + 5, criticalVib, maxChartVal);
                return (
                  <g>
                    <circle cx={intersectCoords.x} cy={intersectCoords.y} r="5" fill="var(--accent-crimson)" className="pulse-glow-crimson" />
                    <text x={intersectCoords.x - 30} y={intersectCoords.y - 12} fill="var(--text-primary)" fontSize="8" fontWeight="600">
                      Failure: Day {hitLimitDay}
                    </text>
                  </g>
                );
              })()
            )}
          </svg>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--text-muted)", padding: "0 10px" }}>
            <span>-5 Days (Historical)</span>
            <span>Today</span>
            <span>+25 Days (Forecast Projection)</span>
          </div>
        </div>

        {/* Explainability Block */}
        <div style={{
          background: "rgba(245, 158, 11, 0.04)",
          border: "1px solid rgba(245, 158, 11, 0.12)",
          padding: "12px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}>
          <span style={{ fontWeight: "600", color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle size={12} />
            Prognostic Assessment Rationale:
          </span>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.4" }}>
            Estimated degradation rate is based on linear wear models. 
            Vibration slope is at <strong style={{ color: "var(--text-primary)" }}>{vibRate} mm/s/day</strong>. 
            Lubricant viscosity breakdown has reduced bearing dampening by <strong style={{ color: "var(--text-primary)" }}>{100 - lubrication}%</strong>. 
            Recommendation: replace lubrication seals immediately to reduce the degradation slope by 80%.
          </p>
        </div>

      </div>

    </div>
  );
}
