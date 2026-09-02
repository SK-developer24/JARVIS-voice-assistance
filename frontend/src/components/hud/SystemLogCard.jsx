import React from 'react';
import { ShieldCheck, ChevronRight, SlidersHorizontal } from 'lucide-react';

export function SystemLogCard({ telemetry }) {
  const healthMessage = telemetry?.system_health || "All systems are functioning normally.";

  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-1.5">
        <span>SYSTEM LOG</span>
        <SlidersHorizontal className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Message & Shield Status */}
      <div className="flex items-center justify-between gap-2 my-1">
        <p className="text-[11px] text-cyber-text font-medium leading-relaxed">
          {healthMessage}
        </p>
        <div className="w-8 h-8 rounded-lg bg-cyber-green/10 border border-cyber-green/40 flex items-center justify-center shrink-0 shadow-neon-cyan">
          <ShieldCheck className="w-5 h-5 text-cyber-green" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 mt-1 border-t border-cyber-border/20">
        <button className="text-[10px] font-rajdhani font-bold text-cyber-glow hover:text-cyber-text tracking-wider uppercase flex items-center gap-1 transition-colors">
          <span>VIEW LOGS</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
