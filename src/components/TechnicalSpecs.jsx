import React from "react";
import { 
  BookOpen, 
  GitMerge, 
  Cpu, 
  Award,
  ShieldCheck,
  Upload,
  ArrowRight,
  Database,
  MessageSquare,
  Activity,
  HardDrive
} from "lucide-react";

export default function TechnicalSpecs() {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} style={{ color: "var(--accent-cyan)" }} />
          <span>AURA Technical Defense Architecture</span>
        </h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
          Detailed system explanations addressing core engineering decisions and judging criteria.
        </p>
      </div>

      {/* Interactive System Architecture Flowchart Card */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>AURA Coordinator & Agent Flowchart</h3>
        
        {/* Flow Columns Layout */}
        <div style={{
          background: "rgba(4,6,10,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          overflowX: "auto"
        }}>
          {/* Step 1: Upload */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1.5px dashed rgba(0,242,254,0.3)",
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
            width: "120px",
            flexShrink: 0
          }}>
            <Upload size={18} style={{ color: "var(--accent-cyan)", marginBottom: "4px" }} />
            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>Upload Ingest</div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", marginTop: "2px" }}>CSV / TXT / EML</div>
          </div>

          <ArrowRight size={16} style={{ color: "var(--text-secondary)" }} />

          {/* Step 2: Coordinator */}
          <div style={{
            background: "rgba(0, 242, 254, 0.04)",
            border: "1.5px solid var(--accent-cyan)",
            boxShadow: "0 0 10px rgba(0,242,254,0.1)",
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
            width: "130px",
            flexShrink: 0
          }}>
            <Cpu size={18} style={{ color: "var(--accent-cyan)", marginBottom: "4px" }} />
            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>Coordinator</div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", marginTop: "2px" }}>Blackboard Orchestrator</div>
          </div>

          <ArrowRight size={16} style={{ color: "var(--text-secondary)" }} />

          {/* Step 3: Specialist Agents Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "8px",
            width: "200px",
            flexShrink: 0
          }}>
            <div style={{ fontSize: "0.58rem", gridColumn: "span 2", textAlign: "center", color: "var(--text-secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "3px", marginBottom: "3px", fontWeight: "700" }}>
              7 SPECIALIST AGENTS
            </div>
            {["Parser", "Extractor", "Graph Mapped", "SCADA Risk", "Prognostic RUL", "Compliance"].map(s => (
              <div key={s} style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.03)", padding: "2px 4px", borderRadius: "3px", textAlign: "center", border: "1px solid rgba(255,255,255,0.04)" }}>
                {s}
              </div>
            ))}
          </div>

          <ArrowRight size={16} style={{ color: "var(--text-secondary)" }} />

          {/* Step 4: Shared Memory Blackboard */}
          <div style={{
            background: "rgba(59, 130, 246, 0.05)",
            border: "1.5px solid var(--accent-blue)",
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
            width: "130px",
            flexShrink: 0
          }}>
            <HardDrive size={18} style={{ color: "var(--accent-blue)", marginBottom: "4px" }} />
            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>Blackboard</div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", marginTop: "2px" }}>Dynamic Shared Cache</div>
          </div>

          <ArrowRight size={16} style={{ color: "var(--text-secondary)" }} />

          {/* Step 5: Dashboard Outflow */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "140px",
            flexShrink: 0
          }}>
            {[
              { label: "Memory Graph", icon: Database, color: "var(--accent-emerald)" },
              { label: "Decision Copilot", icon: MessageSquare, color: "var(--accent-cyan)" },
              { label: "Operations Center", icon: Activity, color: "var(--accent-amber)" }
            ].map(out => {
              const Icon = out.icon;
              return (
                <div key={out.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  fontSize: "0.68rem"
                }}>
                  <Icon size={12} style={{ color: out.color }} />
                  <span style={{ fontWeight: "500" }}>{out.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Grid: FAQ Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Card 1: KG vs Vector Search */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <GitMerge size={16} />
            <span>1. Knowledge Graph vs. Vector Search</span>
          </h3>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            Traditional vector database systems search for text chunk semantic similarity. If you search for "Pump P-102 startup temperature," standard RAG retrieves text matching "startup" and "temperature".
          </p>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            <strong>Why AURA uses a hybrid Knowledge Graph:</strong>
            <br />
            Industrial assets are defined by strict topological relationships. If Pump P-102 is connected to Valve V-12, this physical relation is critical. RAG cannot guarantee this connection model. AURA builds an ontology where entities are nodes and connections are edges (e.g. <code>P-102</code> -[Connected To]-&gt; <code>V-12</code>). Queries navigate the graph structure to guarantee 100% accurate entity tracing and eliminate hallucinations.
          </p>

          <table style={{ width: "100%", fontSize: "0.7rem", borderCollapse: "collapse", marginTop: "8px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                <th style={{ padding: "6px" }}>Feature</th>
                <th style={{ padding: "6px" }}>Vector Search</th>
                <th style={{ padding: "6px", color: "var(--accent-cyan)" }}>AURA Hybrid KG</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "6px", fontWeight: "600" }}>Query Intent</td>
                <td style={{ padding: "6px" }}>Semantic matching</td>
                <td style={{ padding: "6px", color: "var(--accent-cyan)" }}>Ontological traversal</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "6px", fontWeight: "600" }}>Asset Tracking</td>
                <td style={{ padding: "6px" }}>Unstructured matches</td>
                <td style={{ padding: "6px", color: "var(--accent-cyan)" }}>Strict node-to-node linking</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "6px", fontWeight: "600" }}>Hallucination Risk</td>
                <td style={{ padding: "6px" }}>Moderate to High</td>
                <td style={{ padding: "6px", color: "var(--accent-cyan)" }}>Zero (grounded structure)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Card 2: Agent Orchestration Coordination */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={16} />
            <span>2. Agent Coordination (Blackboard Design)</span>
          </h3>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            Instead of executing a fragile linear pipeline where failure at one point breaks subsequent outputs, AURA implements an **Autonomous Blackboard Orchestration Pattern**.
          </p>
          <div style={{
            background: "rgba(4,6,10,0.4)",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.05)",
            fontSize: "0.75rem",
            lineHeight: "1.4"
          }}>
            <strong>Central Coordinator:</strong> Manages state and routes data to specialist agents.
            <br />
            <strong>Shared Blackboard Memory:</strong> A global database workspace. Specialists watch the blackboard, grab relevant data, execute computations, and update the blackboard.
            <br />
            <strong>Specialists:</strong> (Document Parser, Entity Extractor, Graph Builder, Risk Analyzer, Prognostic Modeler, Compliance Inspector, Executive Summarizer).
          </div>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            This design allows parallel agent workflows, asynchronous retries, and confidence propagation: each agent logs its confidence coefficient, allowing engineers to audit the exact chain of reasoning.
          </p>
        </div>

        {/* Card 3: Continuous Learning Feedback Loops */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={16} />
            <span>3. Continuous Improvement Feedback Loops</span>
          </h3>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            AURA continuously improves using **Reinforcement Learning from Human Feedback (RLHF)** styles at the edge. When a plant operator reviews an AURA maintenance decision, they can click <strong>Correct ✅</strong> or <strong>Incorrect ❌</strong>.
          </p>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            - **Positive feedback**: Increments the specific agent weight values, boosting confidence ratings for matching causal paths.
            - **Negative feedback**: Penalizes agent weight factors, forcing the Coordinator to route similar anomalies through alternative prediction nodes (e.g. lowering vibration weights and triggering secondary temperature checks).
          </p>
        </div>

        {/* Card 4: Scalability & Enterprise Integration */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} />
            <span>4. Scalability & Plant System Integration</span>
          </h3>
          <p style={{ fontSize: "0.8rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
            AURA is engineered to easily scale and integrate with standard plant systems:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div>
              <strong>• SCADA / DCS Telemetry:</strong> Ingests live Modbus/OPC-UA time-series pipelines into the risk detection blackboard.
            </div>
            <div>
              <strong>• CMMS / ERP integration:</strong> Auto-triggers maintenance work orders directly in SAP/IBM Maximo databases.
            </div>
            <div>
              <strong>• Edge Device Deployment:</strong> Responsive mobile RAG allows field operators to scan QR codes on equipment and access local graph data offline.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
