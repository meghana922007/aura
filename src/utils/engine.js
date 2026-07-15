// Text cleaning and Jaccard Similarity Engine
export function cleanTokens(text) {
  if (!text) return [];
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "if", "then", "of", "to", "in", "on", "at", "by", "for", "with", "about", "against", "during", "before", "after", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that", "these", "those"]);
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

export function computeJaccardSimilarity(textA, textB) {
  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  
  return intersection.size / union.size;
}

// Regex-based Industrial Entity Extraction Agent
export function parseDocument(name, content) {
  const text = content || "";
  
  // Extract tags matching typical plant syntax: P-XXX, M-XXX, V-XXX, B-XXX, C-XXX
  const tagRegex = /\b([PMVBC]-\d{3})\b/gi;
  const rawTags = text.match(tagRegex) || [];
  const tags = [...new Set(rawTags.map(t => t.toUpperCase()))];
  
  // Extract parameters (e.g. vibration: 5.2 mm/s, temperature: 75 C, pressure: 12 bar)
  const paramRegexes = [
    { name: "Vibration", regex: /vibration\s*[:=]?\s*([\d.]+)\s*(mm\/s|m\/s\^2)?/i, unit: "mm/s" },
    { name: "Temperature", regex: /(temp|temperature)\s*[:=]?\s*([\d.]+)\s*(°?c|f)?/i, unit: "°C" },
    { name: "Pressure", regex: /pressure\s*[:=]?\s*([\d.]+)\s*(bar|psi|kpa)/i, unit: "bar" },
    { name: "Lubrication", regex: /(lubrication|lubricant|oil\s+level)\s*[:=]?\s*([\d.]+)\s*%?/i, unit: "%" },
    { name: "Flow Rate", regex: /flow\s*rate\s*[:=]?\s*([\d.]+)\s*(l\/min|gpm|m\^3\/h)/i, unit: "L/min" }
  ];
  
  const parameters = [];
  paramRegexes.forEach(p => {
    const match = text.match(p.regex);
    if (match) {
      parameters.push(`${p.name}: ${match[1]} ${p.unit}`);
    }
  });
  
  // Extract regulations
  const regRegexes = [
    /\b(OISD-STD-\d{3})\b/gi,
    /\b(PESO-\d{4}-Act|PESO)\b/gi,
    /\b(ISO-\d{4})\b/gi,
    /\b(Boiler\s+Act\s+\d{4})\b/gi,
    /\b(Factory\s+Act)\b/gi
  ];
  
  const regulations = [];
  regRegexes.forEach(r => {
    const matches = text.match(r) || [];
    matches.forEach(m => {
      if (!regulations.includes(m.toUpperCase())) {
        regulations.push(m.toUpperCase());
      }
    });
  });
  
  // Classify category based on keywords
  let category = "Operational Manual";
  const textLower = text.toLowerCase();
  if (textLower.includes("incident") || textLower.includes("failure") || textLower.includes("near-miss") || textLower.includes("breakdown")) {
    category = "Incident Report";
  } else if (textLower.includes("sop") || textLower.includes("procedure") || textLower.includes("startup") || textLower.includes("operation")) {
    category = "SOP";
  } else if (textLower.includes("audit") || textLower.includes("compliance") || textLower.includes("regulation") || textLower.includes("inspector")) {
    category = "Compliance Sheet";
  }

  // Base confidence score computation based on text quality indicators
  const extractionConfidence = Math.min(
    0.98,
    0.70 + (tags.length > 0 ? 0.10 : 0) + (parameters.length > 0 ? 0.10 : 0) + (regulations.length > 0 ? 0.08 : 0)
  );

  return {
    name,
    category,
    content,
    entities: {
      tags,
      parameters,
      regulations,
      personnel: ["System Extractor"]
    },
    ingestionConfidence: 0.96, // File read level
    extractionConfidence
  };
}

// Lessons Learned Similarity Search
export function findSimilarIncidents(newText, historicalIncidents) {
  const matches = historicalIncidents.map(inc => {
    // We combine title, description, and root cause for comparative matching
    const incFullText = `${inc.title} ${inc.description} ${inc.rootCause}`;
    const similarity = computeJaccardSimilarity(newText, incFullText);
    
    // Scale similarity slightly for visualization (Jaccard can be strict)
    // E.g., if there is a 10% raw overlap in unique words, it's actually highly similar in context.
    const scaledSimilarity = Math.min(0.99, similarity * 2.5);
    
    return {
      ...inc,
      similarityScore: scaledSimilarity
    };
  });
  
  return matches
    .filter(m => m.similarityScore > 0.15)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

// Predictive Maintenance RUL Degradation Formula
// RUL = (Critical Limit - Current Value) / Degradation Rate
export function calculateRUL(currentVal, criticalLimit, ratePerDay) {
  if (ratePerDay <= 0) return 365; // stable
  
  const distance = criticalLimit - currentVal;
  if (distance <= 0) return 0; // already failing
  
  const rul = distance / ratePerDay;
  return parseFloat(rul.toFixed(1));
}

// Multi-Agent Confidence Propagation
// Takes base scores, applies feedback loop adjustments
export function propagateConfidence(agents, userFeedbackRatio = 1.0) {
  const result = [];
  let currentConf = 1.0;
  
  agents.forEach(agent => {
    // Adjust base confidence slightly based on user feedback history
    const adjustedAgentBase = Math.min(0.99, agent.baseScore * userFeedbackRatio);
    currentConf = currentConf * adjustedAgentBase;
    
    result.push({
      name: agent.name,
      base: agent.baseScore,
      cumulative: parseFloat((currentConf * 100).toFixed(1))
    });
  });
  
  return result;
}

// RAG Memory Keyword Finder
export function searchRAGMemory(query, docs) {
  const cleanedQuery = cleanTokens(query);
  if (cleanedQuery.length === 0) return [];
  
  const scores = docs.map(doc => {
    let score = 0;
    cleanedQuery.forEach(qTerm => {
      const regex = new RegExp(qTerm, "gi");
      const occurrences = (doc.content.match(regex) || []).length;
      score += occurrences;
      
      // Bonus for matches in metadata tags
      const entitiesString = JSON.stringify(doc.entities).toLowerCase();
      if (entitiesString.includes(qTerm)) {
        score += 3;
      }
    });
    
    return {
      doc,
      score
    };
  });
  
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.doc);
}
