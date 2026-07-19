import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from "lucide-react";

interface HandoffValveProps {
  id: string;
  source: string;
  target: string;
  verdict: "CLEAN" | "SUSPICIOUS" | "INJECTED" | "NOT_EVALUATED";
  reason: string;
  shieldBlocked: boolean;
  onInspect: () => void;
}

export default function HandoffValve({
  id,
  source,
  target,
  verdict,
  reason,
  shieldBlocked,
  onInspect,
}: HandoffValveProps) {
  // Styles based on safety verdict
  const getVerdictStyles = () => {
    switch (verdict) {
      case "CLEAN":
        return {
          bgColor: "bg-emerald-950/40 border-emerald-500/50 text-emerald-400",
          glowColor: "shadow-[0_0_10px_rgba(16,185,129,0.1)]",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          lineColor: "stroke-emerald-500/80",
          flowAnimation: "animate-flow-line",
          label: "CLEAN",
        };
      case "SUSPICIOUS":
        return {
          bgColor: "bg-amber-950/40 border-amber-500/50 text-amber-400",
          glowColor: "shadow-[0_0_10px_rgba(245,158,11,0.1)]",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
          lineColor: "stroke-amber-500/80",
          flowAnimation: "animate-flow-line",
          label: "SUSPICIOUS",
        };
      case "INJECTED":
        return {
          bgColor: "bg-rose-950/50 border-rose-500/60 text-rose-400",
          glowColor: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
          icon: <ShieldX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
          lineColor: shieldBlocked ? "stroke-rose-600/50 stroke-dasharray-[4,4]" : "stroke-rose-500/80",
          flowAnimation: shieldBlocked ? "" : "animate-flow-line",
          label: shieldBlocked ? "BLOCKED" : "TAINTED",
        };
      case "NOT_EVALUATED":
      default:
        return {
          bgColor: "bg-slate-900 border-slate-850 text-slate-500",
          glowColor: "shadow-transparent",
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-600" />,
          lineColor: "stroke-slate-800",
          flowAnimation: "",
          label: "PENDING",
        };
    }
  };

  const styles = getVerdictStyles();

  return (
    <div className="flex flex-col items-center justify-center py-4 md:py-0 px-2 min-w-[120px] md:min-w-[170px] h-full relative group">
      {/* Visual connector line (hidden on mobile, shown on desktop) */}
      <div className="hidden md:block absolute left-0 right-0 top-[38px] h-[2px] z-0">
        <svg className="w-full h-[6px] overflow-visible">
          <path
            d="M 0 3 L 1000 3"
            className={`${styles.lineColor} ${styles.flowAnimation}`}
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      {/* Safety Handoff Valve Bubble */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onInspect}
        disabled={verdict === "NOT_EVALUATED"}
        className={`z-10 flex flex-col items-center justify-center p-2.5 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer ${
          verdict === "NOT_EVALUATED" ? "cursor-not-allowed opacity-50" : "hover:border-cyan-400/80"
        } ${styles.bgColor} ${styles.glowColor}`}
      >
        <span className="text-[9px] font-mono tracking-wider text-slate-500 mb-1">
          {id === "handoff_a_b" ? "A → B GUARD" : "B → C GUARD"}
        </span>
        <div className="flex items-center gap-1.5">
          {styles.icon}
          <span className="text-[10px] font-mono font-bold tracking-widest">{styles.label}</span>
        </div>
        
        {verdict !== "NOT_EVALUATED" && (
          <span className="text-[8px] text-cyan-400 mt-1 font-mono group-hover:underline">
            Click to Inspect
          </span>
        )}
      </motion.button>

      {/* Label indicating blocked or propagated state */}
      {verdict !== "NOT_EVALUATED" && (
        <div className="mt-2 text-center z-10">
          {shieldBlocked ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              ⛔ Blocked
            </span>
          ) : verdict === "INJECTED" && !shieldBlocked ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              ⚠️ Tainted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/5 text-emerald-500/50">
              ✔️ Passed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
