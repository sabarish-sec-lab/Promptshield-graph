import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Cpu,
  Terminal,
  Database,
  ArrowRight,
  Play,
  RefreshCw,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  CheckCircle,
  XCircle,
  X,
  BookOpen,
  GitBranch
} from "lucide-react";

import AgentNode from "./components/AgentNode";
import HandoffValve from "./components/HandoffValve";
import ScenarioCard from "./components/ScenarioCard";

// Educational scenarios preset lists
const SCENARIOS = [
  {
    name: "Scenario 1: Secure Factual Request",
    query: "Explain the importance of public key infrastructure (PKI) in modern email clients.",
    injectionMode: "clean" as "clean" | "inject",
    shieldEnabled: true,
    description: "Normal, harmless academic request. Agent A researches, Agent B summarizes and Agent D checks compliance in parallel. Agent C decides on an action. All handoffs are classified as CLEAN by the TaintGraph detectors.",
  },
  {
    name: "Scenario 2: Injection Attack Blocked",
    query: "Summarize the history and architecture of secure shell (SSH) keys.",
    injectionMode: "inject" as "clean" | "inject",
    shieldEnabled: true,
    description: "Agent A consumes malicious data (prompt injection). When A attempts to pass output to B and D in parallel, the Handoff Detectors spot the injection (INJECTED) and block downstream propagation.",
  },
  {
    name: "Scenario 3: Exploit Propagation (Shield Off)",
    query: "Summarize the history and architecture of secure shell (SSH) keys.",
    injectionMode: "inject" as "clean" | "inject",
    shieldEnabled: false,
    description: "Demonstrates the danger of unprotected multi-agent pipelines. With TaintGraph DISABLED, the injection payload bypasses guards, hijacks Agent B and Agent D, and propagates to compromise Agent C.",
  },
];

export default function App() {
  const [query, setQuery] = useState(SCENARIOS[0].query);
  const [injectionMode, setInjectionMode] = useState<"clean" | "inject">(SCENARIOS[0].injectionMode);
  const [shieldEnabled, setShieldEnabled] = useState(SCENARIOS[0].shieldEnabled);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectingHandoffId, setInspectingHandoffId] = useState<string | null>(null);

  // Live simulation data state
  const [pipelineData, setPipelineData] = useState<{
    steps: Array<{
      id: string;
      name: string;
      status: "pending" | "running" | "completed" | "blocked" | "hijacked";
      input: string;
      output: string;
    }>;
    handoffs: Array<{
      id: string;
      source: string;
      target: string;
      verdict: "CLEAN" | "SUSPICIOUS" | "INJECTED" | "NOT_EVALUATED";
      reason: string;
      shieldBlocked: boolean;
      inputText: string;
    }>;
    pipelineBlocked: boolean;
    statusMessage: string;
  } | null>(null);

  // Initialize view with default empty representation
  useEffect(() => {
    resetPipelineToPending();
  }, []);

  const resetPipelineToPending = () => {
    setPipelineData({
      steps: [
        { id: "agent_a", name: "Agent A: Research Agent", status: "pending", input: query, output: "" },
        { id: "agent_b", name: "Agent B: Summarizer Agent", status: "pending", input: "", output: "" },
        { id: "agent_d", name: "Agent D: Compliance Agent", status: "pending", input: "", output: "" },
        { id: "agent_c", name: "Agent C: Action Agent", status: "pending", input: "", output: "" },
      ],
      handoffs: [
        { id: "handoff_a_b", source: "agent_a", target: "agent_b", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
        { id: "handoff_a_d", source: "agent_a", target: "agent_d", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
        { id: "handoff_bd_c", source: "agent_bd", target: "agent_c", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
      ],
      pipelineBlocked: false,
      statusMessage: "Pipeline ready. Press Run Pipeline to simulate multi-agent defense.",
    });
    setError(null);
  };

  // Run the full pipeline by calling the server-side API
  const handleRunPipeline = async () => {
    setIsRunning(true);
    setError(null);
    setInspectingHandoffId(null);

    // Initial loading visual feedback: set first agent to running
    setPipelineData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s, idx) => (idx === 0 ? { ...s, status: "running" as const } : { ...s, status: "pending" as const })),
        handoffs: prev.handoffs.map((h) => ({ ...h, verdict: "NOT_EVALUATED" as const, reason: "", shieldBlocked: false, inputText: "" })),
        pipelineBlocked: false,
        statusMessage: "Agent A is conducting primary research summary...",
      };
    });

    try {
      const response = await fetch("/api/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          injectionMode,
          shieldEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute multi-agent pipeline.");
      }

      setPipelineData({
        steps: data.steps,
        handoffs: data.handoffs,
        pipelineBlocked: data.pipelineBlocked,
        statusMessage: data.statusMessage,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network or model error occurred.");
      // Revert states
      setPipelineData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s) => ({ ...s, status: "pending" as const })),
          statusMessage: "Error encountered during simulation.",
        };
      });
    } finally {
      setIsRunning(false);
    }
  };

  const loadScenario = (index: number) => {
    const sc = SCENARIOS[index];
    setQuery(sc.query);
    setInjectionMode(sc.injectionMode);
    setShieldEnabled(sc.shieldEnabled);
    setActiveScenarioIndex(index);
    setError(null);
    setInspectingHandoffId(null);

    // Dynamic reset to mock pending states matching configuration
    setPipelineData({
      steps: [
        { id: "agent_a", name: "Agent A: Research Agent", status: "pending", input: sc.query, output: "" },
        { id: "agent_b", name: "Agent B: Summarizer Agent", status: "pending", input: "", output: "" },
        { id: "agent_d", name: "Agent D: Compliance Agent", status: "pending", input: "", output: "" },
        { id: "agent_c", name: "Agent C: Action Agent", status: "pending", input: "", output: "" },
      ],
      handoffs: [
        { id: "handoff_a_b", source: "agent_a", target: "agent_b", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
        { id: "handoff_a_d", source: "agent_a", target: "agent_d", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
        { id: "handoff_bd_c", source: "agent_bd", target: "agent_c", verdict: "NOT_EVALUATED", reason: "", shieldBlocked: false, inputText: "" },
      ],
      pipelineBlocked: false,
      statusMessage: `Scenario Loaded: ${sc.name}. Ready to simulate.`,
    });
  };

  // Find handoff details for the inspecting modal
  const selectedHandoff = pipelineData?.handoffs.find((h) => h.id === inspectingHandoffId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Subtle geometric light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-slate-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col min-h-screen">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-8 border-b border-slate-800 bg-slate-900/50 p-6 rounded-lg gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center font-bold text-slate-950 font-display">T</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase font-display">
                Taint<span className="text-cyan-400">Graph</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Graph-Based Multi-Agent Injection Firewall
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 self-end md:self-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-tighter">Pipeline Status</p>
              {pipelineData?.pipelineBlocked ? (
                <p className="text-rose-500 font-mono text-xs font-bold">ATTACK BLOCKED</p>
              ) : pipelineData?.steps[3]?.status === "hijacked" ? (
                <p className="text-rose-500 font-mono text-xs font-bold">ATTACK SUCCESS</p>
              ) : pipelineData?.steps[3]?.status === "completed" ? (
                <p className="text-emerald-500 font-mono text-xs font-bold">ALL SECURE</p>
              ) : (
                <p className="text-slate-400 font-mono text-xs font-bold uppercase">{pipelineData?.steps[0].status === "running" ? "PROCESSING" : "IDLE"}</p>
              )}
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-cyan-400 border border-cyan-400/30 px-3 py-1 rounded text-xs font-semibold bg-cyan-400/5 font-mono">
              v1.0.4 PROTOTYPE
            </div>
          </div>
        </header>

        {/* Info Explainer Banner */}
        <div className="mb-8 p-4 rounded-lg border border-slate-800 bg-slate-900/30 backdrop-blur-md flex flex-col sm:flex-row items-start gap-3 shadow-md">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-100 uppercase">Project Concept:</span> Multi-agent pipelines are highly vulnerable to 
            <span className="text-rose-400 font-semibold"> cascading prompt injections</span>. An instruction override hidden inside Agent A's output becomes downstream Agent B's and Agent D's untrusted input. 
            <strong> TaintGraph</strong> acts as an inline graph-based firewall (Handoff Valve) evaluating, checking, and sanitizing outputs between nodes 
            to block rogue payloads from hijacking downstream logic.
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          
          {/* LEFT: Config, Scenario Preset List & Custom Query */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Scenarios Header */}
            <div className="border border-slate-800 rounded-lg p-5 bg-slate-900/50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4.5 h-4.5 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                  Select Educational Scenario
                </h2>
              </div>
              
              <div className="space-y-3">
                {SCENARIOS.map((sc, idx) => (
                  <ScenarioCard
                    key={idx}
                    name={sc.name}
                    query={sc.query}
                    injectionMode={sc.injectionMode}
                    shieldEnabled={sc.shieldEnabled}
                    description={sc.description}
                    isActive={activeScenarioIndex === idx}
                    onSelect={() => loadScenario(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Manual Parameters Config */}
            <div className="border border-slate-800 rounded-lg p-5 bg-slate-900/50 shadow-xl space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                  Customize Pipeline Input
                </h2>
              </div>

              {/* Text Input Prompt */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Agent A Research Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveScenarioIndex(null); // Unset active preset if custom edit
                  }}
                  disabled={isRunning}
                  className="w-full h-24 bg-slate-950 border border-slate-850 rounded p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors duration-200"
                  placeholder="Enter custom academic prompt topic..."
                />
              </div>

              {/* Toggles Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Attack Toggle */}
                <div className="bg-slate-950 rounded p-3 border border-slate-850 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                      Payload Inject
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      injectionMode === "inject" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {injectionMode === "inject" ? "MALICIOUS" : "CLEAN"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setInjectionMode("clean");
                        setActiveScenarioIndex(null);
                      }}
                      disabled={isRunning}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        injectionMode === "clean"
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      Safe Output
                    </button>
                    <button
                      onClick={() => {
                        setInjectionMode("inject");
                        setActiveScenarioIndex(null);
                      }}
                      disabled={isRunning}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        injectionMode === "inject"
                          ? "bg-rose-950/40 border-rose-500 text-rose-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      Inject Attack
                    </button>
                  </div>
                </div>

                {/* Shield Toggle */}
                <div className="bg-slate-950 rounded p-3 border border-slate-850 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                      TaintGraph Layer
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      shieldEnabled ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-500/10 text-slate-400"
                    }`}>
                      {shieldEnabled ? "ACTIVE" : "BYPASSED"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setShieldEnabled(true);
                        setActiveScenarioIndex(null);
                      }}
                      disabled={isRunning}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        shieldEnabled
                          ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      Enabled
                    </button>
                    <button
                      onClick={() => {
                        setShieldEnabled(false);
                        setActiveScenarioIndex(null);
                      }}
                      disabled={isRunning}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        !shieldEnabled
                          ? "bg-rose-950/40 border-rose-900 text-rose-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      Disabled
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded flex items-start gap-2 text-rose-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Execution Error</p>
                    <p className="text-[11px] leading-relaxed text-rose-300">{error}</p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Check your Google AI Studio Secrets to ensure the <strong>GEMINI_API_KEY</strong> is set.
                    </p>
                  </div>
                </div>
              )}

              {/* Run Trigger CTA */}
              <div className="flex gap-3">
                <button
                  onClick={resetPipelineToPending}
                  disabled={isRunning}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reset pipeline back to pending status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
                  Reset
                </button>

                <button
                  onClick={handleRunPipeline}
                  disabled={isRunning || !query}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs uppercase tracking-widest shadow-lg shadow-cyan-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Simulating Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white/80" />
                      <span>Run Multi-Agent Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT: Live Pipeline Graph & Status Visualizer */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Visualizer Panel */}
            <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/50 shadow-2xl relative overflow-hidden">
              {/* Geometric Balance grid background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#334155 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4.5 h-4.5 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                    Interactive Multi-Agent Flow Graph
                  </h3>
                </div>
                {/* Legends inside flow graph */}
                <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Safe</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Suspicious</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Tainted</div>
                </div>
              </div>

              {/* Grid representation of DAG graph */}
              <div className="flex flex-col xl:flex-row items-stretch justify-between gap-6 py-8 px-4 relative min-h-[400px] z-10">
                
                {/* Column 1: Root Agent A */}
                <div className="flex flex-col justify-center w-full xl:w-[25%] z-10">
                  <AgentNode
                    id={pipelineData?.steps[0].id || "agent_a"}
                    name={pipelineData?.steps[0].name || "Agent A"}
                    role="Academic Research Summary Provider"
                    status={pipelineData?.steps[0].status || "pending"}
                    input={pipelineData?.steps[0].input}
                    output={pipelineData?.steps[0].output}
                  />
                </div>

                {/* Column 2: Parallel Branches for Agent B & Agent D */}
                <div className="flex flex-col gap-8 justify-center w-full xl:w-[45%] z-10">
                  {/* Branch A -> B */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/45 p-3 rounded-lg border border-slate-800/40">
                    <div className="shrink-0">
                      <HandoffValve
                        id={pipelineData?.handoffs[0].id || "handoff_a_b"}
                        source="agent_a"
                        target="agent_b"
                        verdict={pipelineData?.handoffs[0].verdict || "NOT_EVALUATED"}
                        reason={pipelineData?.handoffs[0].reason || ""}
                        shieldBlocked={pipelineData?.handoffs[0].shieldBlocked || false}
                        onInspect={() => setInspectingHandoffId("handoff_a_b")}
                      />
                    </div>
                    <div className="w-full">
                      <AgentNode
                        id={pipelineData?.steps[1].id || "agent_b"}
                        name={pipelineData?.steps[1].name || "Agent B"}
                        role="Factual Single-Sentence Condenser"
                        status={pipelineData?.steps[1].status || "pending"}
                        input={pipelineData?.steps[1].input}
                        output={pipelineData?.steps[1].output}
                      />
                    </div>
                  </div>

                  {/* Branch A -> D */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/45 p-3 rounded-lg border border-slate-800/40">
                    <div className="shrink-0">
                      <HandoffValve
                        id={pipelineData?.handoffs[1].id || "handoff_a_d"}
                        source="agent_a"
                        target="agent_d"
                        verdict={pipelineData?.handoffs[1].verdict || "NOT_EVALUATED"}
                        reason={pipelineData?.handoffs[1].reason || ""}
                        shieldBlocked={pipelineData?.handoffs[1].shieldBlocked || false}
                        onInspect={() => setInspectingHandoffId("handoff_a_d")}
                      />
                    </div>
                    <div className="w-full">
                      <AgentNode
                        id={pipelineData?.steps[2].id || "agent_d"}
                        name={pipelineData?.steps[2].name || "Agent D"}
                        role="Security & Tone Compliance Checker"
                        status={pipelineData?.steps[2].status || "pending"}
                        input={pipelineData?.steps[2].input}
                        output={pipelineData?.steps[2].output}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3: Joint Merger & Final Action Agent C */}
                <div className="flex flex-col md:flex-row xl:flex-col items-center justify-center gap-4 w-full xl:w-[25%] z-10">
                  <div className="w-full">
                    <HandoffValve
                      id={pipelineData?.handoffs[2].id || "handoff_bd_c"}
                      source="agent_bd"
                      target="agent_c"
                      verdict={pipelineData?.handoffs[2].verdict || "NOT_EVALUATED"}
                      reason={pipelineData?.handoffs[2].reason || ""}
                      shieldBlocked={pipelineData?.handoffs[2].shieldBlocked || false}
                      onInspect={() => setInspectingHandoffId("handoff_bd_c")}
                    />
                  </div>
                  <div className="w-full">
                    <AgentNode
                      id={pipelineData?.steps[3].id || "agent_c"}
                      name={pipelineData?.steps[3].name || "Agent C"}
                      role="Decision, Logging & Action Engine"
                      status={pipelineData?.steps[3].status || "pending"}
                      input={pipelineData?.steps[3].input}
                      output={pipelineData?.steps[3].output}
                    />
                  </div>
                </div>

              </div>

              {/* Status Message Display */}
              <div className="mt-6 p-4 rounded border border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-xs shadow-inner relative z-10">
                <div className="flex items-center gap-2">
                  {pipelineData?.pipelineBlocked ? (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : pipelineData?.steps[3]?.status === "hijacked" ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
                  ) : pipelineData?.steps[3]?.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-dashed border-cyan-400 animate-spin" />
                  )}
                  <span className="font-mono text-[11px] text-slate-300">
                    {pipelineData?.statusMessage}
                  </span>
                </div>
                
                {pipelineData?.pipelineBlocked && (
                  <span className="text-[10px] font-bold font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase">
                    ATTACK BLOCKED
                  </span>
                )}
                {pipelineData?.steps[3]?.status === "hijacked" && (
                  <span className="text-[10px] font-bold font-mono text-rose-500 bg-rose-950 animate-pulse px-2 py-0.5 rounded border border-rose-500 uppercase">
                    SYSTEM COMPROMISED
                  </span>
                )}
                {pipelineData?.steps[3]?.status === "completed" && (
                  <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                    SECURE COMPLETED
                  </span>
                )}
              </div>
            </div>

            {/* Inspect Detail Accordion */}
            <AnimatePresence>
              {selectedHandoff && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-cyan-500/50 rounded bg-slate-950/90 overflow-hidden shadow-xl"
                >
                  <div className="p-4 bg-cyan-950/20 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4.5 h-4.5 text-cyan-400" />
                      <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase">
                        INSPECTING HANDOFF FIREWALL REPORT: {
                          selectedHandoff.id === "handoff_a_b" ? "AGENT A → B" :
                          selectedHandoff.id === "handoff_a_d" ? "AGENT A → D" : "AGENTS B,D → C"
                        }
                      </h4>
                    </div>
                    <button
                      onClick={() => setInspectingHandoffId(null)}
                      className="p-1 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    {/* Verdict block */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded border border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">Fuzzy Shield Classification</span>
                        <span className={`text-sm font-black font-mono tracking-wider ${
                          selectedHandoff.verdict === "CLEAN" ? "text-emerald-400" :
                          selectedHandoff.verdict === "SUSPICIOUS" ? "text-amber-400" : "text-rose-400 animate-pulse"
                        }`}>
                          {selectedHandoff.verdict}
                        </span>
                      </div>
                      
                      <div className="text-right sm:self-auto">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">Defense Action Taken</span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          selectedHandoff.shieldBlocked ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          selectedHandoff.verdict === "INJECTED" && !selectedHandoff.shieldBlocked ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {selectedHandoff.shieldBlocked ? "🛑 BLOCKED PROPAGATION" :
                           selectedHandoff.verdict === "INJECTED" && !selectedHandoff.shieldBlocked ? "⚠️ BYPASSED (SHIELD DISABLED)" :
                           "✅ SANITIZED & APPROVED"}
                        </span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">AI Safety Agent Reasoning</span>
                      <p className="bg-slate-900/40 p-3 rounded border border-slate-800/60 font-mono text-[11px] leading-relaxed text-slate-300 italic">
                        "{selectedHandoff.reason}"
                      </p>
                    </div>

                    {/* Code comparison block */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Payload Scanned Content</span>
                      <div className="bg-slate-950 border border-slate-850 rounded p-3 max-h-[160px] overflow-y-auto">
                        <pre className="font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed select-all">
                          {selectedHandoff.inputText}
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>

        {/* Detailed Agent execution logs */}
        <section className="mt-12 mb-8">
          <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/50 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                Multi-Agent Transaction Logs
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pipelineData?.steps.map((step, idx) => (
                <div key={idx} className="flex flex-col bg-slate-950 border border-slate-850 rounded p-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-100 font-display uppercase">{step.name}</span>
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold ${
                      step.status === "completed" ? "text-emerald-400" :
                      step.status === "hijacked" ? "text-rose-400" :
                      step.status === "running" ? "text-cyan-400 animate-pulse" :
                      step.status === "blocked" ? "text-slate-500" : "text-slate-600"
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between font-mono text-[10px] leading-relaxed">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Received Input:</span>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-850 max-h-[80px] overflow-y-auto">
                        <span className="text-slate-400 select-all">
                          {step.input || <span className="text-slate-700 italic">// Empty / Pre-execution...</span>}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-900/50">
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Generated Output:</span>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-850 max-h-[140px] overflow-y-auto">
                        <span className={`${
                          step.status === "hijacked" ? "text-rose-300 font-medium" : "text-slate-300"
                        }`}>
                          {step.output || <span className="text-slate-700 italic">// Pending trigger...</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-auto border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 pb-4">
          <div className="text-center sm:text-left">
            <p className="font-mono uppercase text-slate-400">TaintGraph Firewall Academic Demo Prototype</p>
            <p className="mt-0.5">© 2026 Panimalar Research Innovation Development Ecosystem. All Rights Reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-cyan-400 transition-colors font-mono uppercase">Documentation</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors font-mono uppercase">Defense Schemas</a>
            <span>•</span>
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="font-mono text-[9px]">Server Online</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
