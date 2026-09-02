import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';

export function ActivityMonitor({ activities = [] }) {
  const displayList = activities.length > 0 ? activities.slice(0, 5) : [
    { id: 1, time: "16:10:24", text: "Opened YouTube" },
    { id: 2, time: "16:09:15", text: "Searched Python tutorials" },
    { id: 3, time: "16:08:02", text: "Opened VS Code" },
    { id: 4, time: "16:07:10", text: "Played Music" },
    { id: 5, time: "16:06:45", text: "System Scan Completed" },
  ];

  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-2">
        <span>ACTIVITY MONITOR</span>
        <Activity className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Activity Item List */}
      <div className="space-y-1.5 mb-2">
        {displayList.map((item) => (
          <div
            key={item.id || item.text}
            className="flex items-center gap-2 text-[10.5px] py-0.5 border-b border-cyber-border/10 last:border-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-glow shrink-0 shadow-neon-cyan animate-pulse"></span>
            <span className="font-mono text-cyber-muted text-[10px] shrink-0">
              {item.time}
            </span>
            <span className="text-cyber-text truncate font-medium">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* View All Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-cyber-border/20">
        <button className="text-[10px] font-rajdhani font-bold text-cyber-glow hover:text-cyber-text tracking-wider uppercase flex items-center gap-1 transition-colors">
          <span>VIEW ALL</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
