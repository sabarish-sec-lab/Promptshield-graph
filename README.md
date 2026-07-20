# TaintGraph: A Graph-Based Cross-Agent Prompt Injection Firewall for Multi-Agent AI Pipelines

TaintGraph is an advanced, highly visual, educational prototype demonstrating **cascading prompt injections** and **graph-based mitigation firewalls** in multi-agent AI topologies.

Multi-agent networks are highly vulnerable to cascading instructional compromises: if an upstream agent processes an untrusted or injected payload, its output becomes infected and "taints" subsequent downstream agents that treat it as trusted system inputs. TaintGraph implements an inline, multi-branching firewall layer (Handoff Valves) that intercepts, evaluates, and blocks malicious directives before they can propagate.

---

## 🚀 Key Features & Architectural Improvements

### 1. Complex Branching Graph (DAG) Topology
Unlike simple linear pipelines, real-world agent networks leverage branching and parallel dependencies. TaintGraph implements a four-agent, three-handoff Directed Acyclic Graph:
```
           +-----------------------+
           | Agent A: Research     |
           +-----------+-----------+
                       |
         +-------------+-------------+
         | (A -> B)                  | (A -> D)
         v                           v
  +---------------+           +---------------+
  | Agent B:      |           | Agent D:      |
  | Summarizer    |           | Compliance    |
  +-------+-------+           +-------+-------+
          |                           |
          +-------------+-------------+
                        |
                        v (Joint Merger: BD -> C)
            +-----------------------+
            | Agent C: Action Agent |
            +-----------------------+
```

*   **Agent A (Research Agent):** Generates academic summaries from user-provided research queries.
*   **Agent B (Summarizer Agent):** Downstream worker that condenses Agent A's research into a single concise sentence.
*   **Agent D (Compliance Agent):** Downstream compliance worker executing in parallel to Agent B, verifying academic tone and guidelines.
*   **Agent C (Action Agent):** Consolidated executor that recommends a final downstream action based on the merged outputs of both Agent B and Agent D.

### 2. Inline Handoff Valve Firewalls
Every handoff between agents acts as a sandboxed firewall checkpoint powered by `gemini-2.5-flash` safety classifiers:
*   **Handoff A → B Guard & Handoff A → D Guard:** Parallel detectors parsing Agent A's output for instructional hijacking, bypass commands, or "ignore previous instructions" overrides.
*   **Handoff BD → C Guard:** A joint-merger classifier that sanitizes and validates the combined outputs of both downstream workers before they feed into Agent C's decision space.

### 3. Dual-Mode Demonstration Toggles
*   **Shield Enabled (Fail-Closed Block):** Prompt detection is active. Any suspicious or injected payloads are caught, and the affected branch or joint-merger is instantly shut down (blocked) to protect downstream logic.
*   **Shield Disabled (Fail-Open Compromise):** Simulates how a single malicious prompt cascades across an unguarded pipeline, causing Agent B, Agent D, and finally Agent C to completely break character and succumb to instructions hijacking.

### 4. Detector Fail-Safe Resilience
*   **Deliberate Fail-Closed Choice:** In the event of network timeouts, API rate-limiting, or model errors, the detector catch-blocks default to a safe `SUSPICIOUS` verdict. This ensures system security is maintained, refusing to allow unvetted content to flow forward.

---

## 💻 Tech Stack & API Integration

*   **Frontend:** React 18 with Vite, styled with Tailwind CSS, leveraging `motion` for beautiful reactive status transitions.
*   **Backend:** Express full-stack proxy running on Node.js.
*   **LLM Engine:** `@google/genai` TypeScript SDK utilizing the modern, highly available `gemini-2.5-flash` model.

---

## 🛠️ Quick Start & Installation

### 1. Prerequisites
Ensure you have Node.js (v18+) installed.

### 2. Configure Environment Secrets
Create a `.env` file at the root of your project or configure your cloud environment:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 3. Run Development Server
Install dependencies and launch the server on port `3000`:
```bash
npm install
npm run dev
```

### 4. Build for Production
To bundle and compile the application for server deployment:
```bash
npm run build
npm start
```
The server will boot and serve the production bundles seamlessly at `http://0.0.0.0:3000`.

---

## 🎓 Educational Scenarios Included

1.  **Secure Factual Request:** Represents an all-clean, standard academic flow. Both branches verify safely, and Agent C executes standard academic recommended logging actions.
2.  **Injection Attack Blocked:** Demonstrates malicious input where Agent A is exploited. The TaintGraph Handoff Firewalls instantly detect the injection and halt propagation at the transition, protecting Agent B, D, and C.
3.  **Exploit Propagation (Shield Off):** Disables the firewall guards to display how the override trickles down and successfully hijacks Agent C's execution outputs, warning developers why robust cross-agent firewalls are mandatory.
