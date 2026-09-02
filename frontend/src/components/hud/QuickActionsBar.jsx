import React from 'react';
import { Folder, Globe, Wrench, Settings, Power } from 'lucide-react';

const ACTIONS = [
  { id: 'file_manager', label: 'FILE MANAGER', sub: 'Browse Files', icon: Folder, color: 'text-cyber-glow' },
  { id: 'web_search', label: 'WEB SEARCH', sub: 'Search the Web', icon: Globe, color: 'text-blue-400' },
  { id: 'system_tools', label: 'SYSTEM TOOLS', sub: 'Utilities', icon: Wrench, color: 'text-cyan-300' },
  { id: 'settings', label: 'SETTINGS', sub: 'Preferences', icon: Settings, color: 'text-emerald-400' },
  { id: 'shutdown', label: 'SHUTDOWN', sub: 'System Power', icon: Power, color: 'text-red-400' },
];

export function QuickActionsBar({ onTriggerAction }) {
  return (
    <div className="w-full grid grid-cols-5 gap-3 max-w-4xl mx-auto">
      {ACTIONS.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={() => onTriggerAction && onTriggerAction(act.id)}
            className="glass-panel-interactive rounded-xl p-2.5 flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#071736] border border-cyber-border/40 flex items-center justify-center mb-1.5 group-hover:border-cyber-glow group-hover:bg-[#0c2452] transition-all">
              <Icon className={`w-4 h-4 ${act.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="text-[10px] font-orbitron font-bold tracking-wider text-cyber-text group-hover:text-cyber-glow">
              {act.label}
            </div>
            <div className="text-[9px] font-rajdhani font-semibold text-cyber-muted -mt-0.5">
              {act.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}
