import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';

export function VoiceControlBar({ mode = 'idle', liveTranscript = '', spokenResponse = '', onToggleMic }) {
  const frequencies = useAudioVisualizer(mode, 28);

  const leftBars = frequencies.slice(0, 14).reverse();
  const rightBars = frequencies.slice(14, 28);

  const getDisplayText = () => {
    if (mode === 'listening') {
      return liveTranscript ? `You: "${liveTranscript}"` : "Listening for command...";
    }
    if (mode === 'processing') {
      return "Processing intent...";
    }
    if (mode === 'speaking') {
      return spokenResponse ? `JARVIS: "${spokenResponse}"` : "JARVIS is responding...";
    }
    return "Click microphone to speak, or say 'Hey JARVIS'...";
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Voice Status / Live Transcript Text */}
      <div className={`text-xs font-rajdhani font-bold tracking-wider uppercase mb-1.5 transition-all text-center px-4 truncate max-w-xl ${
        mode === 'listening'
          ? 'text-cyber-glow animate-pulse'
          : mode === 'speaking'
          ? 'text-cyber-green'
          : 'text-cyber-muted'
      }`}>
        {getDisplayText()}
      </div>

      {/* Main Glass Capsule */}
      <div className="w-full glass-panel rounded-full px-6 py-2 flex items-center justify-between shadow-neon-cyan">
        
        {/* Left Audio Waveform Equalizer */}
        <div className="flex items-center gap-1 h-8 flex-1 justify-end pr-4">
          {leftBars.map((height, i) => (
            <div
              key={`l-${i}`}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-full transition-all duration-75 shadow-card-glow ${
                mode === 'speaking' ? 'bg-cyber-green' : 'bg-cyber-glow'
              }`}
            />
          ))}
        </div>

        {/* Center Glowing Microphone Button */}
        <button
          onClick={onToggleMic}
          title={mode === 'listening' ? "Stop listening" : "Start voice listening"}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer ${
            mode === 'listening'
              ? 'bg-cyber-blue border-2 border-cyber-glow shadow-neon-blue'
              : mode === 'speaking'
              ? 'bg-emerald-950 border-2 border-cyber-green shadow-neon-cyan'
              : 'bg-[#071838] border border-cyber-border hover:border-cyber-glow shadow-card-glow'
          }`}
        >
          {mode === 'listening' && (
            <span className="absolute inset-0 rounded-full border border-cyber-glow animate-ping opacity-75 pointer-events-none"></span>
          )}
          <Mic className={`w-5 h-5 ${
            mode === 'listening'
              ? 'text-white animate-pulse'
              : mode === 'speaking'
              ? 'text-cyber-green'
              : 'text-cyber-glow'
          }`} />
        </button>

        {/* Right Audio Waveform Equalizer */}
        <div className="flex items-center gap-1 h-8 flex-1 justify-start pl-4">
          {rightBars.map((height, i) => (
            <div
              key={`r-${i}`}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-full transition-all duration-75 shadow-card-glow ${
                mode === 'speaking' ? 'bg-cyber-green' : 'bg-cyber-glow'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
