import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, ShieldCheck, ShieldOff, Play } from "lucide-react";

interface ScenarioCardProps {
  key?: any;
  name: string;
  query: string;
  injectionMode: "clean" | "inject";
  shieldEnabled: boolean;
  description: string;
  isActive: boolean;
  onSelect: () => void;
}

export default function ScenarioCard({
  name,
  query,
  injectionMode,
  shieldEnabled,
  description,
  isActive,
  onSelect,
}: ScenarioCardProps) {
  const getBadge = () => {
    if (injectionMode === "clean") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" /> CLEAN RUN
        </span>
      );
    } else if (shieldEnabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <ShieldAlert className="w-3 h-3" /> SECURED PIPELINE
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <ShieldOff className="w-3 h-3" /> BYPASSED
        </span>
      );
    }
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={onSelect}
      className={`text-left w-full rounded-lg p-4 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
        isActive
          ? "bg-slate-900 border-cyan-500 shadow-cyan-950/20 shadow-md"
          : "bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/70"
      }`}
    >
      {/* Active side-indicator line */}
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />}

      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-xs font-bold text-slate-100 tracking-tight font-display uppercase">{name}</h4>
          {getBadge()}
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-850 pt-2.5 mt-1">
        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[80%]">
          "{query}"
        </span>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400">
          <span>LOAD</span>
          <Play className="w-2.5 h-2.5 fill-current" />
        </div>
      </div>
    </motion.button>
  );
}
