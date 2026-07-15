import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ExecutiveCommand from "./components/ExecutiveCommand";
import AgentPipelineGraph from "./components/AgentPipelineGraph";
import PredictiveMaintenance from "./components/PredictiveMaintenance";
import LessonsLearned from "./components/LessonsLearned";
import ExpertCopilot from "./components/ExpertCopilot";
import TechnicalSpecs from "./components/TechnicalSpecs";
import { initialAssets, initialDocuments } from "./data/initialData";
import { ShieldCheck, Database, HardDrive, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("command");
  const [assets, setAssets] = useState(initialAssets);
  const [ingestedDocs, setIngestedDocs] = useState(initialDocuments);
  const [feedbackRatio, setFeedbackRatio] = useState(1.0); // RLHF parameter
  const [activeAssetId, setActiveAssetId] = useState("P-102");
  
  // Track active scenario notifications
  const [activeScenarioAlert, setActiveScenarioAlert] = useState(null);

  // Unified callback for zero-click file uploads
  const handleIngestDocument = (newDoc) => {
    setIngestedDocs(prev => {
      if (prev.some(d => d.name === newDoc.name)) return prev;
      return [...prev, newDoc];
    });

    // Extract values dynamically and update the associated physical asset
    if (newDoc.entities && newDoc.entities.tags.length > 0) {
      const primaryTag = newDoc.entities.tags[0];
      const updates = {};
      
      newDoc.entities.parameters.forEach(p => {
        const parts = p.split(":");
        if (parts.length >= 2) {
          const name = parts[0].trim().toLowerCase();
          const val = parseFloat(parts[1]);
          if (!isNaN(val)) {
            if (name === "vibration") updates.vibration = val;
            if (name === "temperature" || name === "temp") updates.temperature = val;
            if (name === "lubrication" || name === "oil level") updates.lubrication = val;
            if (name === "flow rate") updates.flowRate = val;
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        handleUpdateAssetTelemetry(primaryTag, updates);
        
        // Trigger a global scenario alert
        setActiveScenarioAlert({
          tag: primaryTag,
          docName: newDoc.name,
          updates
        });
      }
    }
  };

  const handleUpdateAssetTelemetry = (assetId, updatedFields) => {
    setAssets(prev => {
      const target = prev[assetId];
      if (!target) return prev;
      
      const newTelemetry = { ...target.telemetry, ...updatedFields };
      
      // Compute status dynamically
      let status = "Healthy";
      let riskScore = 12;
      
      if (assetId === "P-102") {
        const vibration = newTelemetry.vibration;
        const lubrication = newTelemetry.lubrication;
        
        if (vibration > 7.0 || lubrication < 30) {
          status = "Critical";
          riskScore = 88;
        } else if (vibration > 4.5 || lubrication < 60) {
          status = "Warning";
          riskScore = 68;
        } else {
          status = "Healthy";
          riskScore = 15;
        }
      } else if (assetId === "V-15") {
        const leakage = newTelemetry.leakage;
        if (leakage > 0.08) {
          status = "Warning";
          riskScore = 54;
        } else {
          status = "Healthy";
          riskScore = 12;
        }
      } else {
        status = target.status;
        riskScore = target.riskScore;
      }

      return {
        ...prev,
        [assetId]: {
          ...target,
          telemetry: newTelemetry,
          status,
          riskScore: updatedFields.riskScore !== undefined ? updatedFields.riskScore : riskScore
        }
      };
    });
  };

  const handleSelectAsset = (assetId) => {
    setActiveAssetId(assetId);
  };

  const warningCount = Object.values(assets).filter(a => a.status !== "Healthy").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "transparent", color: "var(--text-primary)" }}>
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertsCount={warningCount} 
      />

      {/* Main Body */}
      <main style={{
        flexGrow: 1,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        height: "calc(100vh - 32px)",
        overflowY: "auto",
        marginTop: "16px",
        marginRight: "16px"
      }}>
        
        {/* Operations Command Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          borderRadius: "12px",
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          border: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)"
        }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} style={{ color: "var(--accent-cyan)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Plant Safety State:</span>
              <span className={`status-badge ${warningCount > 0 ? "warning" : "healthy"}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                {warningCount > 0 ? `${warningCount} RISKS ACTIVE` : "ONLINE & SECURE"}
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={16} style={{ color: "var(--accent-blue)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Industrial Memory Nodes:</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", fontFamily: "JetBrains Mono" }}>{ingestedDocs.length * 3 + 7}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <HardDrive size={12} />
              <span>Blackboard state: Connected</span>
            </div>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-emerald)",
              boxShadow: "0 0 8px var(--accent-emerald)"
            }} />
          </div>
        </header>

        {/* Global Demo Scenario Alert Banner */}
        {activeScenarioAlert && (
          <div className="glass-panel" style={{
            padding: "12px 18px",
            background: "linear-gradient(90deg, rgba(239, 68, 68, 0.08), rgba(0, 242, 254, 0.03))",
            borderColor: "rgba(239, 68, 68, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Sparkles size={16} style={{ color: "var(--accent-amber)" }} />
              <span>
                <strong>Walkthrough Story Mode</strong>: Ingestion of <code>{activeScenarioAlert.docName}</code> has dynamically updated physical asset <strong>{activeScenarioAlert.tag}</strong>. Telemetry is now at: <code style={{ color: "var(--accent-cyan)" }}>{JSON.stringify(activeScenarioAlert.updates)}</code>. Look at the Digital Twin and RUL charts to see the changes!
              </span>
            </div>
            <button 
              onClick={() => setActiveScenarioAlert(null)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Modules */}
        <div style={{ flexGrow: 1, display: "flex" }}>
          {activeTab === "command" && (
            <ExecutiveCommand 
              assets={assets} 
              onSelectAsset={handleSelectAsset} 
              feedbackRatio={feedbackRatio}
              setFeedbackRatio={setFeedbackRatio}
              ingestedDocs={ingestedDocs}
            />
          )}

          {activeTab === "pipeline" && (
            <AgentPipelineGraph 
              onIngestDocument={handleIngestDocument} 
              ingestedDocs={ingestedDocs}
              feedbackRatio={feedbackRatio}
              onUpdateAssetTelemetry={handleUpdateAssetTelemetry}
            />
          )}

          {activeTab === "maintenance" && (
            <PredictiveMaintenance 
              assets={assets} 
              activeAssetId={activeAssetId} 
              onUpdateAssetTelemetry={handleUpdateAssetTelemetry}
            />
          )}

          {activeTab === "lessons" && (
            <LessonsLearned />
          )}

          {activeTab === "copilot" && (
            <ExpertCopilot ingestedDocs={ingestedDocs} />
          )}

          {activeTab === "technical" && (
            <TechnicalSpecs />
          )}
        </div>

      </main>
    </div>
  );
}
