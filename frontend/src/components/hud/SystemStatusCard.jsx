import React from 'react';
import { Battery, BatteryCharging, Wifi, ChevronRight } from 'lucide-react';

function CircularProgress({ value, label, color = '#00f0ff' }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 -rotate-90 transform">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="rgba(0, 240, 255, 0.15)"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-mono font-bold text-cyber-text">
          {value}%
        </span>
      </div>
      <div>
        <div className="text-[10px] font-rajdhani font-bold tracking-wider text-cyber-muted uppercase">
          {label}
        </div>
        <div className="text-[11px] font-semibold text-cyber-glow">
          {value}%
        </div>
      </div>
    </div>
  );
}

export function SystemStatusCard({ telemetry }) {
  const cpu = telemetry?.cpu_usage ?? 42;
  const ram = telemetry?.ram_usage ?? 58;
  const battery = telemetry?.battery_percent ?? 86;
  const isCharging = telemetry?.is_charging ?? true;
  const network = telemetry?.network_status ?? "Connected";

  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-2">
        <span>SYSTEM STATUS</span>
        <ChevronRight className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Circular Progress Gauges */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <CircularProgress value={cpu} label="CPU USAGE" color="#00ff9d" />
        <CircularProgress value={ram} label="RAM USAGE" color="#0072ff" />
      </div>

      {/* Bottom Status Row: Battery & Network */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-border/20">
        <div className="flex items-center gap-2">
          {isCharging ? (
            <BatteryCharging className="w-4 h-4 text-cyber-green shrink-0" />
          ) : (
            <Battery className="w-4 h-4 text-cyber-glow shrink-0" />
          )}
          <div>
            <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted">
              BATTERY
            </div>
            <div className="text-[11px] font-semibold text-cyber-text font-mono">
              {battery}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyber-green shrink-0" />
          <div>
            <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted">
              NETWORK
            </div>
            <div className="text-[11px] font-semibold text-cyber-green font-mono">
              {network}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
