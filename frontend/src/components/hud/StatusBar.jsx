import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';

export function StatusBar({ isConnected, statusMessage = "JARVIS is online and ready to assist you!" }) {
  const miniWaves = useAudioVisualizer(isConnected ? 'idle' : 'processing', 8);

  return (
    <footer className="w-full flex items-center justify-between px-6 py-2 border-t border-cyber-border/30 bg-[#040917]/90 backdrop-blur-md z-20">
      {/* Left: Online Badge & Status Message */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? 'bg-cyber-green' : 'bg-amber-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isConnected ? 'bg-cyber-green shadow-neon-cyan' : 'bg-amber-400'
          }`}></span>
        </span>
        <span className="text-xs font-rajdhani font-semibold tracking-wide text-cyber-text">
          {isConnected ? statusMessage : "Connecting to JARVIS Python Core..."}
        </span>
      </div>

      {/* Center/Right: Mini Voice Equalizer + Arrow */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 h-4">
          {miniWaves.map((h, i) => (
            <div
              key={i}
              style={{ height: `${Math.max(20, h)}%` }}
              className="w-0.5 bg-cyber-glow rounded-full transition-all duration-100"
            />
          ))}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-cyber-muted" />
      </div>
    </footer>
  );
}
