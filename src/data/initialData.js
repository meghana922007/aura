export const historicalIncidents = [
  {
    id: "INC-48",
    title: "Boiler Pump P-102 Discharge Valve Fatigue Leak",
    date: "2026-03-12",
    description: "During high-pressure steam operations, discharge valve fatigue resulted in dynamic fluid pulsing. The line pressure surged from 12 bar to 18 bar, causing gasket blowout, seal failure, and high-temperature steam leak at Pump P-102. Thermal stress accelerated the seal wearing. Vibration levels spiked to 8.2 mm/s before an automatic safety trip.",
    rootCause: "Valve fatigue failure due to fluid pulsing and lack of elastomer replacement.",
    preventiveAction: "Replace elastomer seals every 180 days on high-pressure valves. Install pulsation dampeners on pump discharge pipelines.",
    affectedEquipment: ["P-102", "P-108", "P-123"],
    downtime: "4 hours",
    productionLoss: "₹2.8 Lakhs",
    riskSeverity: "High",
    confidence: "94%"
  },
  {
    id: "INC-31",
    title: "Lubricant Degradation & Overheating in Compressor C-302",
    date: "2025-11-05",
    description: "Compressor C-302 bearing temperature exceeded 85°C, triggering an automatic safety shutdown. Post-incident inspection revealed heavy oil oxidation, carbon sludge deposits, and viscosity degradation. Telemetry logs showed gradual vibration increases (from 2.0 to 6.8 mm/s) over a 15-day period.",
    rootCause: "Oil contamination and thermal breakdown of synthetic lubricant due to high operational cycles.",
    preventiveAction: "Implement monthly oil viscosity testing. Check oil filter differential pressure weekly.",
    affectedEquipment: ["C-302", "C-305"],
    downtime: "8 hours",
    productionLoss: "₹5.5 Lakhs",
    riskSeverity: "High",
    confidence: "89%"
  },
  {
    id: "INC-15",
    title: "Motor M-105 Stator Winding Insulation Breakdown",
    date: "2025-06-22",
    description: "Motor M-105 experienced high winding temperature of 95°C and a sudden current surge up to 24A. Insulation resistance test (Megger) showed complete dielectric breakdown of stator winding insulation due to moisture ingress during heavy monsoon conditions in Pump House 2.",
    rootCause: "Moisture accumulation inside stator winding casing due to degraded enclosure weatherproofing seals.",
    preventiveAction: "Perform winding insulation resistance test every 90 days. Replace enclosure weatherproofing gaskets annually.",
    affectedEquipment: ["M-105", "M-102"],
    downtime: "12 hours",
    productionLoss: "₹8.2 Lakhs",
    riskSeverity: "Critical",
    confidence: "92%"
  }
];

export const initialDocuments = [
  {
    id: "DOC-01",
    name: "SOP-44_Pump_Cold_Startup.pdf",
    type: "pdf",
    size: "245 KB",
    date: "2025-01-10",
    content: "Standard Operating Procedure for Cold Startup of Centrifugal Pumps. Applicable system tags: P-102, M-105. Step 1: Inspect discharge valve V-12 and verify limits. Step 2: Check oil level (must be > 50% capacity). Step 3: Verify suction valve is 100% open. Step 4: Monitor vibration (normal limit is 4.5 mm/s) and bearing temperature (alarm threshold is 75°C). Ensure earthing is secure.",
    entities: {
      tags: ["P-102", "M-105", "V-12"],
      parameters: ["Vibration limit: 4.5 mm/s", "Temp limit: 75°C"],
      regulations: ["Earthing check"],
      personnel: ["Operator A"]
    }
  },
  {
    id: "DOC-02",
    name: "OISD-STD-189_Fire_Safety_Regs.pdf",
    type: "pdf",
    size: "1.2 MB",
    date: "2024-08-15",
    content: "Oil Industry Safety Directorate Standard 189: Fire Protection Facilities for Pump Houses. All rotating equipment (Pumps P-102, P-108, Compressors C-302) must have independent electrical grounding. Bypass valves (V-12, V-15) must undergo quarterly hydro-testing. Portable CO2 fire extinguishers must be inspected and recertified every 180 days. Grounding resistance must be verified below 5.0 Ohms.",
    entities: {
      tags: ["P-102", "P-108", "C-302", "V-12", "V-15"],
      parameters: ["Grounding resistance: < 5.0 Ohms", "Hydro-testing: Quarterly"],
      regulations: ["OISD-STD-189", "CO2 Extinguisher check: 180 days"],
      personnel: ["Safety Officer"]
    }
  },
  {
    id: "DOC-03",
    name: "OEM-P102-Operational-Manual.txt",
    type: "txt",
    size: "128 KB",
    date: "2023-04-05",
    content: "OEM Operational Manual for Centrifugal Pump Model P-102. Running specs: Optimal vibration 1.5 - 3.5 mm/s. High alarm at 4.5 mm/s. Critical trip threshold is 8.5 mm/s. Normal bearing operating temp is 45-60°C. Temperature warning trigger at 75°C, safety trip shutoff at 85°C. Recommended oil change frequency: 3000 operating hours. Replace bearing seals every 360 days to prevent leakage.",
    entities: {
      tags: ["P-102"],
      parameters: ["Vibration trip: 8.5 mm/s", "Temp trip: 85°C", "Oil cycle: 3000 hrs"],
      regulations: ["ISO-5199 design standard"],
      personnel: ["OEM Field Engineer"]
    }
  },
  {
    id: "DOC-04",
    name: "Compliance_Audit_PESO_2025.json",
    type: "json",
    size: "14 KB",
    date: "2025-05-12",
    content: "PESO compliance audit report. Station ID: Boiler Room B-201. Ventilation fans - OK. Relief valve V-15 verification: Valid. Safety checklist item: Grounding wire connection on pump casing: verified. CO2 extinguisher audit in pump bay: OVERDUE (Last certification was 210 days ago, exceeding OISD-189 limit of 180 days). Action required to close compliance gap.",
    entities: {
      tags: ["B-201", "V-15", "P-102"],
      parameters: ["Extinguisher check overdue: 210 days"],
      regulations: ["PESO-2025-Act", "OISD-STD-189 Gap"],
      personnel: ["PESO Auditor"]
    }
  }
];

export const initialAssets = {
  "P-102": {
    name: "Centrifugal Feed Pump P-102",
    type: "Pump",
    location: "Boiler Feed Room",
    status: "Warning",
    telemetry: {
      vibration: 5.2, // normal < 4.5
      temperature: 68, // normal < 60
      lubrication: 54, // normal > 60%
      pressure: 14.2 // bar
    },
    limits: {
      vibration: 8.5,
      temperature: 85,
      lubrication: 20
    },
    connectedTo: ["V-12", "M-105"],
    guidelines: ["SOP-44", "OEM-P102-Manual"],
    complianceRating: "85%",
    riskScore: 68
  },
  "B-201": {
    name: "High Pressure Steam Boiler B-201",
    type: "Boiler",
    location: "Main Boiler Block",
    status: "Healthy",
    telemetry: {
      pressure: 12.1, // bar, limit 16
      temperature: 210, // C, limit 250
      vibration: 1.2,
      lubrication: 95
    },
    limits: {
      pressure: 16.0,
      temperature: 250,
      vibration: 3.5,
      lubrication: 40
    },
    connectedTo: ["V-15", "P-102"],
    guidelines: ["Boiler Act 1923 Guidelines"],
    complianceRating: "100%",
    riskScore: 12
  },
  "V-12": {
    name: "Discharge Control Valve V-12",
    type: "Valve",
    location: "Boiler Feed Room",
    status: "Healthy",
    telemetry: {
      flowRate: 420, // L/min
      leakage: 0.02, // mm, limit 0.1
      vibration: 1.8,
      temperature: 50,
      lubrication: 80
    },
    limits: {
      flowRate: 600,
      leakage: 0.1,
      vibration: 4.5,
      temperature: 80
    },
    connectedTo: ["P-102"],
    guidelines: ["SOP-44", "OISD-STD-189"],
    complianceRating: "100%",
    riskScore: 18
  },
  "M-105": {
    name: "Induction Motor M-105",
    type: "Motor",
    location: "Boiler Feed Room",
    status: "Healthy",
    telemetry: {
      rpm: 1482, // normal ~1500
      temperature: 56, // C, limit 80
      current: 11.2, // A, limit 18
      vibration: 2.1,
      lubrication: 78
    },
    limits: {
      temperature: 80,
      current: 18.0,
      vibration: 5.0
    },
    connectedTo: ["P-102"],
    guidelines: ["SOP-44"],
    complianceRating: "100%",
    riskScore: 15
  },
  "C-302": {
    name: "Rotary Screw Compressor C-302",
    type: "Compressor",
    location: "Utility Bay A",
    status: "Healthy",
    telemetry: {
      vibration: 2.3,
      temperature: 58,
      lubrication: 82,
      pressure: 7.2 // bar
    },
    limits: {
      vibration: 6.8,
      temperature: 85,
      lubrication: 30
    },
    connectedTo: ["V-15"],
    guidelines: ["OISD-STD-189", "Compressor Safety SOP"],
    complianceRating: "100%",
    riskScore: 22
  },
  "V-15": {
    name: "Safety Relief Valve V-15",
    type: "Valve",
    location: "Boiler Boiler Block",
    status: "Warning",
    telemetry: {
      flowRate: 0, // static until trip
      leakage: 0.08, // mm, close to limit 0.1
      vibration: 0.8,
      temperature: 42,
      lubrication: 65
    },
    limits: {
      leakage: 0.1,
      vibration: 3.5,
      temperature: 70
    },
    connectedTo: ["B-201", "C-302"],
    guidelines: ["OISD-STD-189", "Compliance_Audit_PESO_2025"],
    complianceRating: "50%", // overdue extinguisher check nearby
    riskScore: 54
  }
};
