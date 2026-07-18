# AURA API & Core Algorithms Documentation

This document outlines the internal programming interface, mathematical models, and utility functions powering AURA's multi-agent coordination. All algorithms run client-side in the browser.

---

## 1. Prognostics RUL Engine
*   **Source File:** `src/utils/engine.js` -> `calculateRUL()`
*   **Purpose:** Extrapolates remaining operational lifespan based on telemetry limits and degradation rates.

### Function Signature
```javascript
export function calculateRUL(currentValue, limitThreshold, wearRate)
```

### Parameters
*   `currentValue` (Number): The live sensor reading (e.g. current vibration in mm/s).
*   `limitThreshold` (Number): The maximum safe parameter boundary (SCADA trip limit).
*   `wearRate` (Number): Rate of degradation change per day (e.g. mm/s per day).

### Mathematical Model
$$\text{RUL} = \frac{\text{limitThreshold} - \text{currentValue}}{\text{wearRate}}$$

### Returns
*   (Number): Count of days remaining until threshold breach, rounded to 1 decimal place. Returns `0` if threshold is already exceeded.

---

## 2. Token Jaccard Similarity Engine
*   **Source File:** `src/utils/engine.js` -> `findSimilarIncidents()`
*   **Purpose:** Matches fresh operational logs against historical incident databases.

### Function Signature
```javascript
export function findSimilarIncidents(inputText, historicalIncidents)
```

### Parameters
*   `inputText` (String): Raw checksheet descriptions or inspection logs.
*   `historicalIncidents` (Array): Array of historical incident objects containing description, title, and root causes.

### Mathematical Model
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

### Steps
1.  **Stopword Filtering:** Clean punctuation, lowercase text, and remove common English stopwords (e.g., *the, a, and, or*).
2.  **Tokenization:** Extract keyword arrays from inputs ($A$) and candidate reports ($B$).
3.  **Union-Intersection:** Calculate intersection tokens divided by union tokens.
4.  **Sorting:** Returns reports sorted by Jaccard score.

### Returns
*   (Array): Correlated incident objects scoring above a threshold index.

---

## 3. In-Memory Document Parser
*   **Source File:** `src/utils/engine.js` -> `parseDocument()`
*   **Purpose:** Extracts structured entity tags, regulatory codes, and parameters from raw text files.

### Function Signature
```javascript
export function parseDocument(name, content)
```

### Parameters
*   `name` (String): Original file name (e.g. `Checklist_Pump_P102_Log.csv`).
*   `content` (String): Raw file content parsed via the HTML5 `FileReader` API.

### Returns
*   (Object): Structured document object containing:
    *   `id` (String): Random unique ID.
    *   `name` (String): File name.
    *   `content` (String): Cleaned file content.
    *   `entities` (Object):
        *   `tags` (Array): Extracted equipment codes (e.g., `['P-102', 'V-15']`).
        *   `parameters` (Array): Sensor names (e.g., `['vibration', 'temperature']`).
        *   `regulations` (Array): Safety codes (e.g., `['OISD-STD-189']`).

---

## 4. Confidence Weight Propagation
*   **Source File:** `src/utils/engine.js` -> `propagateConfidence()`
*   **Purpose:** Simulates cascading uncertainty across sequential blackboard agents.

### Function Signature
```javascript
export function propagateConfidence(agents, feedbackRatio)
```

### Mathematical Model
$$\text{Cumulative}_i = \text{BaseScore}_i \times \text{Cumulative}_{i-1} \times \text{feedbackRatio}$$

### Returns
*   (Array): Array of agent objects with their cumulative confidence score percentage mapped.
