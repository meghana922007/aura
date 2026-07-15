import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  FileText, 
  AlertTriangle,
} from "lucide-react";
import { searchRAGMemory } from "../utils/engine";

export default function ExpertCopilot({ ingestedDocs }) {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "aura",
      text: "AURA Decision Copilot initialized. Scan local operational guidelines, manuals, compliance logs, or incident archives below.",
      citations: [],
      memoryTrigger: false
    }
  ]);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState(null);

  const chatEndRef = useRef(null);

  const presetQuestions = [
    "How do I perform a cold startup on feed pump P-102?",
    "What are the grounding safety rules under OISD-STD-189?",
    "What is the bearing trip temperature limit on pump P-102?"
  ];

  // Auto-scroll to the bottom of the chat list whenever history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      sender: "user",
      text: textToSend,
      citations: [],
      memoryTrigger: false
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuery("");

    const matchedDocs = searchRAGMemory(textToSend, ingestedDocs);

    setTimeout(() => {
      let responseText = "";
      let citations = [];
      let memoryTrigger = false;

      const queryLower = textToSend.toLowerCase();
      if ((queryLower.includes("p-102") || queryLower.includes("pump")) && 
          (queryLower.includes("vibration") || queryLower.includes("fail") || queryLower.includes("leak") || queryLower.includes("limit"))) {
        memoryTrigger = true;
      }

      if (matchedDocs.length > 0) {
        citations = matchedDocs.map(doc => doc.name);
        const primaryDoc = matchedDocs[0];
        
        if (primaryDoc.id === "DOC-01") {
          responseText = `According to standard operating procedure [SOP-44_Pump_Cold_Startup.pdf]:\n\n` +
            `• Check lubrication oil level (must be > 50% capacity).\n` +
            `• Ensure earthing check is secure on motor M-105.\n` +
            `• Open suction valve 100% before cold startup.\n` +
            `• Monitor vibration (keep under normal limit of 4.5 mm/s) and bearing temperatures (alarm threshold 75°C).`;
        } else if (primaryDoc.id === "DOC-02") {
          responseText = `Under safety regulatory code [OISD-STD-189]:\n\n` +
            `• Grounding resistance for all rotating machinery (Pumps P-102, Compressors C-302) must register below 5.0 Ohms.\n` +
            `• Fire extinguishers must be inspected, weight checked, and recertified every 180 days.\n` +
            `• Pressure bypass valves V-12 and V-15 must undergo hydrostatic testing quarterly.`;
        } else if (primaryDoc.id === "DOC-03") {
          responseText = `According to OEM operating specs for P-102 Centrifugal Pump [OEM-P102-Manual.txt]:\n\n` +
            `• Normal vibration operating range: 1.5 to 3.5 mm/s. High-level alarm triggers at 4.5 mm/s. Emergency safety trip at 8.5 mm/s.\n` +
            `• Normal bearing temperature: 45°C - 60°C. Temperature warning triggers at 75°C, automatic safety shutdown at 85°C.\n` +
            `• Recommended oil change frequency: 3000 running hours. Replacing bearing seals is recommended every 360 days.`;
        } else if (primaryDoc.id === "DOC-04") {
          responseText = `Based on the latest compliance audit sheet [Compliance_Audit_PESO_2025.json]:\n\n` +
            `• Station ID Boiler Room B-201 ventilation fans draw standard currents and passed audit check.\n` +
            `• Relief Valve V-15 verification certificate is valid.\n` +
            `• **Compliance Gap Detected**: CO2 fire extinguisher recertification is OVERDUE (210 days since last check, exceeding OISD-189 limits of 180 days). Immediate inspection is required.`;
        } else {
          responseText = `AURA extracted the following context from newly parsed file [${primaryDoc.name}]:\n\n` +
            `• Detected Equipment Tags: ${primaryDoc.entities.tags.join(", ") || "None"}\n` +
            `• Logged Operational Metrics: ${primaryDoc.entities.parameters.join(", ") || "None"}\n` +
            `• Regulatory references: ${primaryDoc.entities.regulations.join(", ") || "None"}\n` +
            `Content synopsis: ${primaryDoc.content.substring(0, 180)}...`;
        }
      } else {
        responseText = `AURA search index scanned all local documents but found no direct matches for your query. Searching historical incident logs...\n\n` +
          `General non-proliferation guideline safety parameters recommend checking that lines are purged and local grounding is verified below 5.0 Ohms. Please rephrase or upload the missing OEM procedure files.`;
      }

      const auraMessage = {
        sender: "aura",
        text: responseText,
        citations,
        memoryTrigger
      };

      setChatHistory(prev => [...prev, auraMessage]);
    }, 600);
  };

  const handleCitationClick = (docName) => {
    const doc = ingestedDocs.find(d => d.name === docName);
    if (doc) {
      setSelectedCitationDoc(doc);
    }
  };

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: selectedCitationDoc ? "1.1fr 0.9fr" : "1fr", gap: "32px", width: "100%", height: "auto" }}>
      
      {/* Decision Copilot Panel */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", minHeight: "600px", height: "auto", gap: "20px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={18} style={{ color: "var(--accent-cyan)" }} />
              <span>Decision Copilot</span>
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Converses across standard operating procedures, manuals, compliance audits, and incident reports.
            </p>
          </div>
          <span className="status-badge healthy" style={{ fontSize: "0.6rem" }}>Memory Active</span>
        </div>

        {/* Message Logs */}
        <div style={{
          flexGrow: 1,
          background: "rgba(4, 6, 10, 0.4)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "20px",
          overflowY: "auto",
          maxHeight: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {chatHistory.map((msg, idx) => {
            const isAura = msg.sender === "aura";
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px", alignSelf: isAura ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                
                {msg.memoryTrigger && (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.75rem",
                    color: "#f87171",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginBottom: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
                      <AlertTriangle size={14} />
                      CONTINUOUS INDUSTRIAL MEMORY
                    </div>
                    <span>
                      Pump P-102 vibration currently tracks at 7.8 mm/s (Critical Alarm State). Historical logs indicate Incident #48 represents valve fatigue blowout under matching vibration loads. Replace bearing seals immediately.
                    </span>
                  </div>
                )}

                <div style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                  background: isAura ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
                  color: isAura ? "var(--text-primary)" : "#04060a",
                  border: isAura ? "1px solid rgba(255,255,255,0.05)" : "none",
                  whiteSpace: "pre-line"
                }}>
                  {msg.text}
                </div>

                {isAura && msg.citations.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Sources cited:</span>
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleCitationClick(c)}
                        style={{
                          background: "rgba(0, 242, 254, 0.06)",
                          border: "1px solid rgba(0, 242, 254, 0.15)",
                          color: "var(--accent-cyan)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.2s"
                        }}
                      >
                        <FileText size={10} /> {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* Auto-Scroll Anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Presets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Common Queries:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(query); }}
            style={{
              flexGrow: 1,
              background: "rgba(4, 6, 10, 0.5)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
              padding: "14px",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.85rem"
            }}
            placeholder="Query operational bounds, safety codes, memory logs..."
          />
          <button 
            onClick={() => handleSend(query)}
            className="glow-button-primary"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>

      {/* Raw document spec sheet */}
      {selectedCitationDoc && (
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", minHeight: "600px", height: "auto", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.62rem", color: "var(--accent-cyan)", textTransform: "uppercase", fontWeight: "700" }}>Raw Corpus Viewer</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>{selectedCitationDoc.name}</h3>
              <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Size: {selectedCitationDoc.size} | Ingested: {selectedCitationDoc.date}</span>
            </div>
            <button 
              onClick={() => setSelectedCitationDoc(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "1.5rem",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            flexGrow: 1,
            background: "rgba(4, 6, 10, 0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "20px",
            fontFamily: "JetBrains Mono",
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            overflowY: "auto",
            maxHeight: "320px",
            lineHeight: "1.6",
            whiteSpace: "pre-line"
          }}>
            {selectedCitationDoc.content}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            padding: "16px",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>ONTOLOGY LINKS:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
              {selectedCitationDoc.entities.tags.map(t => (
                <span key={t} style={{ fontSize: "0.68rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "3px 8px", borderRadius: "4px", color: "var(--accent-blue)" }}>
                  {t}
                </span>
              ))}
              {selectedCitationDoc.entities.regulations.map(r => (
                <span key={r} style={{ fontSize: "0.68rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "3px 8px", borderRadius: "4px", color: "var(--accent-amber)" }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
