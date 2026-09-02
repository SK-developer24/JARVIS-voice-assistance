import React from 'react';
import { X, Wrench, Cpu, HardDrive, Wifi, Smartphone, RefreshCw, Zap } from 'lucide-react';

export function ToolsModal({ onClose, telemetry, onTriggerAction }) {
  const cpu = telemetry?.cpu_usage ?? 42;
  const ram = telemetry?.ram_usage ?? 58;
  const ramUsed = telemetry?.ram_used_gb ?? 9.2;
  const ramTotal = telemetry?.ram_total_gb ?? 16.0;
  const battery = telemetry?.battery_percent ?? 86;
  const network = telemetry?.network_status ?? "Connected";

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-cyber-glow/50 shadow-neon-cyan overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border/40 bg-[#061536]/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyber-blue/30 border border-cyber-glow flex items-center justify-center">
              <Wrench className="w-4 h-4 text-cyber-glow" />
            </div>
            <div>
              <h3 className="text-base font-orbitron font-bold tracking-wider text-cyber-glow">
                SYSTEM DIAGNOSTICS & HARDWARE TOOLS
              </h3>
              <p className="text-[10px] font-rajdhani font-semibold text-cyber-muted tracking-wider">
                REAL-TIME TELEMETRY ENGINE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* Detailed Hardware Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* CPU Monitor */}
            <div className="p-3.5 rounded-xl bg-[#061430]/80 border border-cyber-border/30">
              <div className="flex items-center justify-between text-cyber-muted text-[10px] font-rajdhani font-bold uppercase mb-1">
                <span>CPU CORES</span>
                <Cpu className="w-3.5 h-3.5 text-cyber-glow" />
              </div>
              <div className="text-2xl font-mono font-bold text-cyber-glow">
                {cpu}%
              </div>
              <div className="w-full bg-[#030a18] h-1.5 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${cpu}%` }} className="bg-cyber-glow h-full transition-all duration-500"></div>
              </div>
            </div>

            {/* RAM Monitor */}
            <div className="p-3.5 rounded-xl bg-[#061430]/80 border border-cyber-border/30">
              <div className="flex items-center justify-between text-cyber-muted text-[10px] font-rajdhani font-bold uppercase mb-1">
                <span>RAM USAGE</span>
                <HardDrive className="w-3.5 h-3.5 text-cyber-blue" />
              </div>
              <div className="text-2xl font-mono font-bold text-cyber-blue">
                {ram}%
              </div>
              <div className="text-[10px] text-cyber-muted font-mono mt-0.5">
                {ramUsed} GB / {ramTotal} GB
              </div>
            </div>

            {/* Network Monitor */}
            <div className="p-3.5 rounded-xl bg-[#061430]/80 border border-cyber-border/30">
              <div className="flex items-center justify-between text-cyber-muted text-[10px] font-rajdhani font-bold uppercase mb-1">
                <span>NETWORK</span>
                <Wifi className="w-3.5 h-3.5 text-cyber-green" />
              </div>
              <div className="text-xl font-mono font-bold text-cyber-green mt-1">
                {network}
              </div>
              <div className="text-[10px] text-cyber-muted font-mono mt-1">
                DNS Probe Active
              </div>
            </div>

          </div>

          {/* POCO M3 Pro 5G Wireless ADB Bridge Card */}
          <div className="p-4 rounded-xl bg-[#05162a]/90 border border-cyber-green/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-green/10 border border-cyber-green/50 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-cyber-green animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyber-text flex items-center gap-2">
                  <span>POCO M3 PRO 5G</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyber-green/20 text-[9px] font-bold text-cyber-green border border-cyber-green/40">
                    WIRELESS ADB CONNECTED
                  </span>
                </div>
                <div className="text-[10.5px] font-mono text-cyber-muted mt-0.5">
                  IP: 10.199.161.165:5555 &bull; Protocol: TCP/IP &bull; Port: 5555
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (onTriggerAction) onTriggerAction("phone_utility", "lock");
              }}
              className="px-3 py-1.5 rounded-lg bg-cyber-green/20 hover:bg-cyber-green/40 border border-cyber-green/50 text-[11px] font-rajdhani font-bold text-cyber-green hover:text-white transition-all cursor-pointer"
            >
              TEST LOCK
            </button>
          </div>

          {/* System Quick Actions */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => {
                if (onTriggerAction) onTriggerAction("file_manager");
                onClose();
              }}
              className="p-2.5 rounded-lg bg-[#07173b] border border-cyber-border/30 hover:border-cyber-glow text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-cyber-glow">File Explorer</div>
              <div className="text-[9px] text-cyber-muted">Browse System Files</div>
            </button>

            <button
              onClick={() => {
                if (onTriggerAction) onTriggerAction("calculator");
                onClose();
              }}
              className="p-2.5 rounded-lg bg-[#07173b] border border-cyber-border/30 hover:border-cyber-glow text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-cyber-glow">Calculator</div>
              <div className="text-[9px] text-cyber-muted">Open Calc Tool</div>
            </button>

            <button
              onClick={() => {
                if (onTriggerAction) onTriggerAction("web_search", "AI News");
                onClose();
              }}
              className="p-2.5 rounded-lg bg-[#07173b] border border-cyber-border/30 hover:border-cyber-glow text-center transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-cyber-glow">Web Search</div>
              <div className="text-[9px] text-cyber-muted">Search Google</div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-border/30 bg-[#051026] flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyber-muted">
            All system diagnostics operating at optimal latency
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-blue/30 hover:bg-cyber-blue/60 border border-cyber-glow/50 text-xs font-rajdhani font-bold text-cyber-glow hover:text-white transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
