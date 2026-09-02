import React from 'react';
import { Volume2, ChevronRight } from 'lucide-react';

const SAMPLE_COMMANDS = [
  { text: "Open YouTube", action: "youtube" },
  { text: "Open Chrome", action: "chrome" },
  { text: "Search Python tutorials", action: "web_search", target: "Python tutorials" },
  { text: "Play music", action: "spotify" },
  { text: "What time is it?", action: "time" }
];

export function VoiceCommandsCard({ onTriggerCommand }) {
  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-2">
        <span>VOICE COMMANDS</span>
        <Volume2 className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Commands List */}
      <div className="space-y-1.5 mb-2">
        {SAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd.text}
            onClick={() => onTriggerCommand && onTriggerCommand(cmd.action, cmd.target)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#071530]/60 border border-cyber-border/20 hover:border-cyber-glow/50 hover:bg-[#0a2046] text-left transition-all duration-200 group"
          >
            <span className="text-[11px] text-cyber-text font-medium group-hover:text-cyber-glow">
              "{cmd.text}"
            </span>
            <ChevronRight className="w-3 h-3 text-cyber-muted group-hover:text-cyber-glow group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-cyber-border/20">
        <button className="text-[10px] font-rajdhani font-bold text-cyber-glow hover:text-cyber-text tracking-wider uppercase flex items-center gap-1 transition-colors">
          <span>VIEW ALL COMMANDS</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
