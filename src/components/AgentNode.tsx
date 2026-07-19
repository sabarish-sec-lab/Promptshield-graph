import React from "react";
import { motion } from "motion/react";
import { Cpu, CheckCircle2, ShieldAlert, AlertTriangle, HelpCircle } from "lucide-react";

interface AgentNodeProps {
  id: string;
  name: string;
  role: string;
  status: "pending" | "running" | "completed" | "blocked" | "hijacked";
  input?: string;
  output?: string;
}

export default function AgentNode({ id, name, role, status, input, output }: AgentNodeProps) {
  // Styles based on agent status
  const getStatusConfig = () => {
    switch (status) {
      case "running":
        return {
          borderColor: "border-cyan-500",
          glowColor: "shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-900/90",
          icon: <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />,
          statusLabel: "Processing...",
          statusTextClass: "text-cyan-400",
        };
      case "completed":
        return {
          borderColor: "border-emerald-500",
          glowColor: "shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-slate-900/95",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          statusLabel: "Completed & Secure",
          statusTextClass: "text-emerald-400",
        };
      case "blocked":
        return {
          borderColor: "border-slate-800",
          glowColor: "bg-slate-900/50 opacity-40",
          icon: <ShieldAlert className="w-5 h-5 text-slate-500" />,
          statusLabel: "Blocked",
          statusTextClass: "text-slate-500",
        };
      case "hijacked":
        return {
          borderColor: "border-rose-500",
          glowColor: "shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-slate-900/90 animate-pulse",
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          statusLabel: "⚠️ HIJACKED",
          statusTextClass: "text-rose-400 font-bold",
        };
      case "pending":
      default:
        return {
          borderColor: "border-slate-800",
          glowColor: "bg-slate-900/40",
          icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
          statusLabel: "Idle",
          statusTextClass: "text-slate-500",
        };
    }
  };

  const config = getStatusConfig();

  // Map Agent IDs to descriptive prefixes for UI
  const getAgentLabel = () => {
    if (id === "agent_a") return "AGENT A";
    if (id === "agent_b") return "AGENT B";
    return "AGENT C";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col w-full rounded-lg border p-5 transition-all duration-300 ${config.borderColor} ${config.glowColor}`}
    >
      {/* Top corner badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
        <span className="text-[9px] font-mono tracking-wider text-slate-400">{getAgentLabel()}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className={`p-2 rounded border ${status === "running" ? "bg-cyan-500/10 border-cyan-500/30" : "bg-slate-950 border-slate-800"}`}>
          {config.icon}
        </div>
        <div className="flex-1 pr-14">
          <h4 className="text-xs font-bold text-slate-100 tracking-tight font-display uppercase">{name}</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{role}</p>
        </div>
      </div>

      {/* Input / Output mini terminal preview */}
      <div className="mt-4 flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Node Status</span>
          <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold ${config.statusTextClass}`}>
            {config.statusLabel}
          </span>
        </div>

        <div className="bg-slate-950 rounded p-3 border border-slate-800 font-mono text-[10px] leading-relaxed min-h-[90px] max-h-[140px] overflow-y-auto">
          {status === "pending" ? (
            <span className="text-slate-600 italic">// Awaiting upstream trigger...</span>
          ) : status === "blocked" ? (
            <span className="text-slate-500 italic">// Execution halted by detector. downstream payload propagation prevented.</span>
          ) : (
            <div className="space-y-2">
              {input && (
                <div>
                  <span className="text-cyan-400 font-semibold">IN:</span>{" "}
                  <span className="text-slate-400 select-all">{input.length > 95 ? input.substring(0, 95) + "..." : input}</span>
                </div>
              )}
              <div>
                <span className={`${status === "hijacked" ? "text-rose-400" : "text-emerald-400"} font-semibold`}>
                  {status === "hijacked" ? "HIJACKED_OUT:" : "OUT:"}
                </span>{" "}
                <span className={status === "hijacked" ? "text-rose-300 font-medium bg-rose-950/20 px-1 py-0.5 rounded border border-rose-900/40" : "text-slate-300"}>
                  {output || "Executing system routine..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
