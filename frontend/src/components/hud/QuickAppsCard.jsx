import React from 'react';
import { Youtube, Chrome, Code2, Music, MessageCircle, Calculator, AppWindow } from 'lucide-react';

const APPS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500 hover:border-red-500/50' },
  { id: 'chrome', name: 'Chrome', icon: Chrome, color: 'text-yellow-400 hover:border-yellow-400/50' },
  { id: 'vscode', name: 'VS Code', icon: Code2, color: 'text-blue-400 hover:border-blue-400/50' },
  { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-green-400 hover:border-green-400/50' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400 hover:border-emerald-400/50' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-cyan-400 hover:border-cyan-400/50' },
];

export function QuickAppsCard({ onLaunchApp }) {
  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-2">
        <span>QUICK APPS</span>
        <AppWindow className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-3 gap-2">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => onLaunchApp && onLaunchApp(app.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg bg-[#07142d]/80 border border-cyber-border/30 hover:bg-[#0a2046] transition-all duration-200 group ${app.color}`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110 mb-1" />
              <span className="text-[10px] font-medium text-cyber-text tracking-tight group-hover:text-cyber-glow">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
