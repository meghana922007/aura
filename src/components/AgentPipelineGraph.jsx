import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  ArrowRight, 
  FileText, 
  Database, 
  RefreshCw,
  Layers,
  Play,
  CheckCircle,
  Loader2
} from "lucide-react";
import { parseDocument, propagateConfidence } from "../utils/engine";

export default function AgentPipelineGraph({ 
  onIngestDocument, 
  ingestedDocs, 
  feedbackRatio,
  onUpdateAssetTelemetry 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1); 
  const [activeLogs, setActiveLogs] = useState([]);
  const [extractedDoc, setExtractedDoc] = useState(null);
  const [selectedGraphNode, setSelectedGraphNode] = useState(null);
  
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
  const animationFrameRef = useRef(null);

  const sampleFiles = [
    {
      name: "Checklist_Pump_P102_Log.csv",
      content: "date,tag,vibration,temperature,lubrication\n2026-07-15,P-102,7.8,79,38\nAction log: Checked pump housing. Vibration is 7.8 mm/s due to loose bearing cap. Core temp is 79 C. Viscosity low.",
      type: "csv"
    },
    {
      name: "Email_Boiler_Steam_Leak.eml",
      content: "From: safety-lead@plant.in\nTo: operations@plant.in\nSubject: Steam leak detected near Valve V-15\nTeam, during site walk at Boiler Block B-201, a small steam hiss was noted near relief valve V-15. Leakage index is 0.08 mm. Violates OISD-STD-189 margins.",
      type: "email"
    }
  ];

  const [graphNodes, setGraphNodes] = useState([
    { id: "P-102", label: "Pump P-102", type: "Asset", x: 120, y: 170, details: "Centrifugal Feed Pump, Boiler Feed Room" },
    { id: "V-12", label: "Valve V-12", type: "Asset", x: 260, y: 80, details: "Discharge Control Valve" },
    { id: "M-105", label: "Motor M-105", type: "Asset", x: 260, y: 260, details: "Drive Induction Motor" },
    { id: "B-201", label: "Boiler B-201", type: "Asset", x: 420, y: 170, details: "High Pressure Boiler Node" },
    { id: "SOP-44", label: "SOP-44 Manual", type: "Standard", x: 120, y: 60, details: "Pump Cold Startup Guidelines" },
    { id: "OISD-STD-189", label: "OISD-STD-189", type: "Regulation", x: 420, y: 60, details: "Fire Safety Standards" },
    { id: "INC-48", label: "Incident #48", type: "Incident", x: 260, y: 170, details: "Discharge Valve fatigue incident, ₹2.8L loss" }
  ]);

  const [graphEdges, setGraphEdges] = useState([
    { from: "P-102", to: "V-12", label: "Connected To" },
    { from: "P-102", to: "M-105", label: "Driven By" },
    { from: "P-102", to: "SOP-44", label: "Covered By" },
    { from: "P-102", to: "INC-48", label: "Failed In" },
    { from: "V-12", to: "INC-48", label: "Origin Element" },
    { from: "B-201", to: "P-102", label: "Fed By" },
    { from: "B-201", to: "OISD-STD-189", label: "Regulated By" }
  ]);

  const agents = [
    { name: "Document Agent", desc: "Format parser & clean bytes" },
    { name: "Entity Extractor", desc: "Extract tags, limits & metrics" },
    { name: "KG Manager", desc: "Map relationships in Memory Graph" },
    { name: "Risk Detection", desc: "Scan SCADA telemetry bounds" },
    { name: "Predictive Maint", desc: "Model linear degradation & RUL" },
    { name: "Compliance Check", desc: "Map environmental rules" },
    { name: "Executive Decision", desc: "Aggregate production loss index" }
  ];

  const confidenceSteps = propagateConfidence(
    agents.map(a => ({ name: a.name, baseScore: 0.94 })), 
    feedbackRatio
  );

  // Standalone canvas rendering method to support animation loops
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Edges
    graphEdges.forEach(edge => {
      const fromNode = graphNodes.find(n => n.id === edge.from);
      const toNode = graphNodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const isHighlighted = selectedGraphNode && (selectedGraphNode.id === edge.from || selectedGraphNode.id === edge.to);
      
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      
      ctx.strokeStyle = isHighlighted ? "#3DD9EB" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = isHighlighted ? 2 : 1;
      
      // Marching ants data flow along highlighted connection lines (Refinement 4)
      if (isHighlighted) {
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -offsetRef.current;
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = "#94A3B8";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(edge.label, midX, midY - 4);
    });

    // Draw Nodes
    graphNodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
      
      let fillColor = "#161E2E";
      let strokeColor = "rgba(255, 255, 255, 0.12)";
      
      if (node.type === "Asset") {
        fillColor = "rgba(79, 140, 255, 0.12)";
        strokeColor = "#4F8CFF";
      } else if (node.type === "Standard") {
        fillColor = "rgba(34, 197, 94, 0.12)";
        strokeColor = "#22C55E";
      } else if (node.type === "Regulation") {
        fillColor = "rgba(251, 191, 36, 0.12)";
        strokeColor = "#FBBF24";
      } else if (node.type === "Incident") {
        fillColor = "rgba(239, 68, 68, 0.12)";
        strokeColor = "#EF4444";
      }

      ctx.fillStyle = fillColor;
      ctx.fill();
      
      ctx.strokeStyle = selectedGraphNode?.id === node.id ? "#3DD9EB" : strokeColor;
      ctx.lineWidth = selectedGraphNode?.id === node.id ? 2.5 : 1.5;
      
      if (selectedGraphNode?.id === node.id) {
        ctx.shadowColor = "#3DD9EB";
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = selectedGraphNode?.id === node.id ? "#3DD9EB" : "#F8FAFC";
      ctx.font = "10px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + 26);
    });
  };

  // Setup requestAnimationFrame loop
  useEffect(() => {
    function animate() {
      offsetRef.current = (offsetRef.current + 0.4) % 10;
      drawGraph();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [graphNodes, graphEdges, selectedGraphNode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = graphNodes.find(node => {
      const dist = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
      return dist <= 20;
    });
    setSelectedGraphNode(clicked || null);
  };

  const executePipelineFlow = (fileName, fileContent, fileType) => {
    setPipelineStep(0);
    setActiveLogs([
      "Coordinator: Allocating shared Memory segments...",
      `Loading data stream: ${fileName} (${fileType.toUpperCase()})`
    ]);

    const parsed = parseDocument(fileName, fileContent);
    setExtractedDoc(parsed);

    const stages = [
      { log: `[Document Ingest Agent] Completed extraction. Cleaned character streams.`, delay: 600 },
      { log: `[Entity Extractor Agent] Extracted Equipment Tags: [${parsed.entities.tags.join(", ") || "None"}]. Extracted Parameters: [${parsed.entities.parameters.join(", ") || "None"}]. Regulatory References: [${parsed.entities.regulations.join(", ") || "None"}].`, delay: 1200 },
      { log: `[KG Manager Agent] Ontology mapped. Creating relationships to dynamic Memory Graph database.`, delay: 1800 },
      { log: `[Risk Detection Agent] Evaluating limits anomalies. Temperature/Vibration deviations logged.`, delay: 2400 },
      { log: `[Predictive Maint Agent] Degradation trend regression analysis computed. RUL calculation completed.`, delay: 3000 },
      { log: `[Compliance Check Agent] Checking OISD regulatory guidelines. Compliance gaps registered on Blackboard.`, delay: 3600 },
      { log: `[Executive Decision Agent] Aggregating production loss estimates. Causal evidence packages built.`, delay: 4200 },
      { log: `[Coordinator] Ingest finalized. Unified UI states and Digital Twin properties refreshed.`, delay: 4800 }
    ];

    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setPipelineStep(idx + 1);
        setActiveLogs(prev => [...prev, stage.log]);

        // Add node dynamically at KG stage
        if (idx === 2) {
          const newNodeId = `DOC-${Date.now()}`;
          const newDocNode = {
            id: newNodeId,
            label: fileName.length > 15 ? fileName.substring(0, 12) + "..." : fileName,
            type: "Standard",
            x: 260 + (Math.random() * 80 - 40),
            y: 310,
            details: `Dynamic Memory Document. Extracted Tags: ${parsed.entities.tags.join(", ")}.`
          };
          setGraphNodes(prev => [...prev, newDocNode]);

          if (parsed.entities.tags.length > 0) {
            setGraphEdges(prev => [
              ...prev,
              { from: newNodeId, to: parsed.entities.tags[0], label: "References" }
            ]);
          }
        }

        // At risk step, if CSV is uploaded with P-102 telemetry, update global telemetry state!
        if (idx === 3 && fileType === "csv") {
          onUpdateAssetTelemetry("P-102", {
            vibration: 7.8,
            temperature: 79,
            lubrication: 38
          });
        } else if (idx === 3 && fileType === "email") {
          onUpdateAssetTelemetry("V-15", {
            leakage: 0.08,
            status: "Warning"
          });
        }

        if (idx === 7) {
          onIngestDocument(parsed);
        }
      }, stage.delay);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const extension = file.name.split(".").pop() || "txt";
      executePipelineFlow(file.name, content, extension);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", width: "100%", height: "auto" }}>
      
      {/* Left Ingest Workspace */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Upload Card */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Industrial Ingestion Hub</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Upload your own CSV, TXT, or safety logs to dynamically update AURA's Memory Graph.
            </p>
          </div>

          <div style={{
            border: dragActive ? "2.5px dashed var(--accent-cyan)" : "1.5px dashed rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.01)",
            padding: "32px 24px",
            borderRadius: "16px",
            textAlign: "center",
            position: "relative",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          >
            <input 
              type="file" 
              accept=".csv,.txt,.eml,.json" 
              onChange={handleFileUpload}
              style={{
                position: "absolute",
                top: 0, left: 0, width: "100%", height: "100%",
                opacity: 0, cursor: "pointer"
              }}
            />
            <Upload size={32} style={{ color: "var(--accent-cyan)", opacity: 0.8, marginBottom: "12px" }} />
            <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
              Drag files here or <span style={{ color: "var(--accent-cyan)", fontWeight: "500" }}>browse folders</span>
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
              Parses .csv (telemetry), .txt (checklists), .eml (incidents)
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Quick Scenario Presets:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sampleFiles.map((f, i) => (
                <button
                  key={i}
                  onClick={() => executePipelineFlow(f.name, f.content, f.type)}
                  disabled={pipelineStep >= 0 && pipelineStep < 8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; e.currentTarget.style.background = "rgba(0,242,254,0.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                >
                  <FileText size={16} style={{ color: "var(--accent-blue)" }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{f.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>{f.content}</div>
                  </div>
                  <Play size={12} style={{ color: "var(--accent-cyan)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Polished Staged Loading Checklist Animation */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} style={{ color: "var(--accent-cyan)" }} />
            <span>Industrial Intelligence Pipeline Orchestrator</span>
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            
            {/* Visual Staged Processing Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(4,6,10,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
              {agents.map((agent, i) => {
                const isPending = pipelineStep <= i;
                const isRunning = pipelineStep === i;
                const isCompleted = pipelineStep > i;

                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", opacity: isPending ? 0.35 : 1, transition: "opacity 0.3s" }}>
                    {isCompleted && <CheckCircle size={12} style={{ color: "#22C55E" }} />}
                    {isRunning && <Loader2 size={12} className="pulse-glow-cyan" style={{ color: "#3DD9EB", animation: "spin 1.5s linear infinite" }} />}
                    {isPending && <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid #475569" }} />}
                    <span style={{ fontWeight: isRunning ? "600" : "400", color: isRunning ? "var(--accent-cyan)" : "var(--text-primary)" }}>{agent.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Ingestion console output */}
            <div style={{
              background: "rgba(4,6,10,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "12px",
              fontFamily: "JetBrains Mono",
              fontSize: "0.68rem",
              color: "var(--text-secondary)",
              height: "170px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              {activeLogs.map((log, idx) => (
                <div key={idx} style={{ lineBreak: "anywhere" }}>
                  <span style={{ color: "var(--accent-cyan)" }}>[LOG]</span> {log}
                </div>
              ))}
              {pipelineStep === -1 && (
                <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                  Waiting for trigger...
                </div>
              )}
            </div>

          </div>

          {/* Confidence cascade */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              Confidence Cascade (Error Propagation)
            </span>
            <div style={{ display: "flex", gap: "2px", height: "16px", borderRadius: "4px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
              {confidenceSteps.map((s, i) => {
                const isActive = pipelineStep > i;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: isActive ? "linear-gradient(to top, #3DD9EB, #4F8CFF)" : "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: "700",
                      color: isActive ? "#04060a" : "var(--text-secondary)",
                      transition: "all 0.3s"
                    }}
                    title={`${s.name}: ${s.cumulative}% cumulative`}
                  >
                    {isActive ? `${s.cumulative}%` : "-"}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "var(--text-secondary)", padding: "0 2px" }}>
              <span>Doc Ingest</span>
              <span>Entity Parse</span>
              <span>Graph Mapped</span>
              <span>Risk Telemetry</span>
              <span>Final Decision</span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Canvas Memory Graph */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Database size={18} style={{ color: "var(--accent-cyan)" }} />
            <span>Industrial Memory Graph</span>
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Traverses physical relationships between equipment tags, SOP guidelines, and historic failure incident logs.
          </p>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={380}
          onClick={handleCanvasClick}
          style={{
            background: "rgba(4, 6, 10, 0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            cursor: "pointer",
            width: "100%",
            height: "380px"
          }}
        />

        {/* Specs Box */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "16px",
          minHeight: "90px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          justifyContent: "center"
        }}>
          {selectedGraphNode ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-cyan)" }}>
                  {selectedGraphNode.label}
                </span>
                <span className="status-badge healthy" style={{ fontSize: "0.6rem", padding: "2px 8px" }}>
                  {selectedGraphNode.type}
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                {selectedGraphNode.details}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.78rem", justifyContent: "center" }}>
              <span>Click a graph node above to traverse ontological properties in memory.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
