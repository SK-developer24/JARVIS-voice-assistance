import React, { useState } from 'react';
import { Mic, Keyboard, MoreVertical, Smartphone, GraduationCap, Settings, Wrench, Grid, RefreshCw } from 'lucide-react';

export function TopNav({ activeTab = 'HOME', onTabChange, phoneStatus, isListening, onToggleMic, onOpenManualInput }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navTabs = ['HOME', 'DASHBOARD', 'APPS', 'TOOLS', 'SETTINGS', 'ABOUT'];

  const handleTabClick = (tab) => {
    setMenuOpen(false);
    if (onTabChange) onTabChange(tab);
  };

  const isPhoneConnected = phoneStatus?.connected ?? true;
  const phoneModel = "POCO M3 PRO 5G";

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b border-cyber-border/40 bg-[#050b1a]/80 backdrop-blur-md z-30 relative">
      {/* Left: J.A.R.V.I.S. Identity & Phone Badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border border-cyber-glow/50 bg-[#061530] flex items-center justify-center shadow-card-glow">
          <svg className="w-5 h-5 text-cyber-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0v-4a8 8 0 0 0-8-8z"/>
            <circle cx="9" cy="10" r="1.5" fill="#00f0ff"/>
            <circle cx="15" cy="10" r="1.5" fill="#00f0ff"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-orbitron font-bold tracking-widest text-cyber-text flex items-center gap-2">
            J.A.R.V.I.S.
          </h1>
          <p className="text-[10px] font-rajdhani font-semibold tracking-wider text-cyber-muted -mt-0.5">
            AI VOICE ASSISTANT
          </p>
        </div>

        {/* Live Phone Bridge Status Badge: POCO M3 PRO 5G */}
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-[#06142e] border border-cyber-border/60 shadow-card-glow">
          <Smartphone className="w-3.5 h-3.5 text-cyber-green shrink-0 animate-pulse" />
          <span className="text-[10.5px] font-rajdhani font-bold text-cyber-text tracking-wider">
            PHONE: <span className="text-cyber-glow">{phoneModel}</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green shadow-neon-cyan animate-pulse"></span>
        </div>
      </div>

      {/* Center: Navigation Pill (Controlled via activeTab prop) */}
      <nav className="flex items-center gap-1 bg-[#061026]/90 border border-cyber-border/40 rounded-full px-2 py-1 shadow-card-glow">
        {navTabs.map((tab) => {
          const isActive = (activeTab === tab) || (tab === 'HOME' && (!activeTab || activeTab === 'HOME'));
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-1 rounded-full text-xs font-rajdhani font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-cyber-blue/40 text-cyber-glow border border-cyber-glow/60 shadow-neon-cyan'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Utility Icons (Mic, Keyboard, 3-Dots Menu) */}
      <div className="flex items-center gap-2 relative">
        
        {/* 1. Microphone Toggle */}
        <button
          onClick={onToggleMic}
          title={isListening ? "Listening... (Click to stop)" : "Click to Speak"}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? 'border-cyber-glow bg-cyber-blue/40 text-cyber-glow shadow-neon-cyan animate-pulse'
              : 'border-cyber-border/60 bg-[#081836] text-cyber-muted hover:text-cyber-glow hover:border-cyber-glow'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* 2. Manual Command Input Toggle */}
        <button
          onClick={onOpenManualInput}
          title="Manual Command & AI Chat Input"
          className="w-8 h-8 rounded-full border border-cyber-border/60 bg-[#081836] flex items-center justify-center text-cyber-muted hover:text-cyber-glow hover:border-cyber-glow hover:bg-white/5 transition-all cursor-pointer"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* 3. 3-Dots Quick Actions Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          title="System Options Menu"
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            menuOpen
              ? 'border-cyber-glow bg-cyber-blue/40 text-cyber-glow shadow-neon-cyan'
              : 'border-cyber-border/60 bg-[#081836] text-cyber-muted hover:text-cyber-glow hover:border-cyber-glow'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-11 w-52 rounded-xl bg-[#061430]/95 border border-cyber-glow/50 shadow-neon-blue backdrop-blur-xl p-2 z-50 animate-fadeIn">
            <div className="text-[10px] font-rajdhani font-bold tracking-widest text-cyber-muted px-2.5 py-1 uppercase border-b border-cyber-border/30 mb-1">
              QUICK SHORTCUTS
            </div>
            
            <button
              onClick={() => handleTabClick('ABOUT')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-cyber-text hover:text-cyber-glow hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-cyber-glow" />
              <span>Project Credentials</span>
            </button>

            <button
              onClick={() => handleTabClick('SETTINGS')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-cyber-text hover:text-cyber-glow hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-cyber-glow" />
              <span>Preferences & Keys</span>
            </button>

            <button
              onClick={() => handleTabClick('APPS')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-cyber-text hover:text-cyber-glow hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              <Grid className="w-4 h-4 text-cyber-glow" />
              <span>Application Catalog</span>
            </button>

            <button
              onClick={() => handleTabClick('TOOLS')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-cyber-text hover:text-cyber-glow hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-cyber-glow" />
              <span>Hardware Diagnostics</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
