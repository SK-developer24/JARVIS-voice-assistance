import React, { useState, useEffect } from 'react';
import { Sun, Moon, Clock, User, ShieldCheck } from 'lucide-react';

export function SystemInfoCard({ telemetry }) {
  const [liveTime, setLiveTime] = useState('16:16:24');
  const [liveDate, setLiveDate] = useState('Sunday, Feb 6, 2024');
  const [isDayTime, setIsDayTime] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toTimeString().split(' ')[0]);
      setLiveDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));

      // Daytime: 4:30 AM (4.5) to 6:00 PM (18.0)
      const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
      const day = currentHourDecimal >= 4.5 && currentHourDecimal < 18.0;
      setIsDayTime(day);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const weather = telemetry?.weather || { 
    temp: isDayTime ? '32°C' : '26°C', 
    condition: isDayTime ? 'Sunny Day' : 'Clear Night' 
  };
  const uptime = telemetry?.uptime || '12h 45m';

  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-1">
        <span>SYSTEM INFO</span>
        <Clock className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Clock & Weather Hero (Sun / Moon Dynamic) */}
      <div className="flex items-center justify-between my-1">
        <div>
          <div className="text-2xl font-mono font-bold tracking-tight text-cyber-glow neon-text-glow">
            {liveTime}
          </div>
          <div className="text-[10px] text-cyber-muted font-medium">
            {liveDate}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#06142e]/70 border border-cyber-border/30 rounded-lg px-2.5 py-1.5 shadow-card-glow">
          {isDayTime ? (
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow shrink-0" />
          ) : (
            <Moon className="w-5 h-5 text-cyber-glow animate-pulse shrink-0" />
          )}
          <div className="text-right">
            <div className="text-xs font-bold text-cyber-text">
              {weather.temp}
            </div>
            <div className="text-[9px] text-cyber-muted leading-tight">
              {isDayTime ? (weather.condition || "Sunny Day") : "Clear Night"}
            </div>
          </div>
        </div>
      </div>

      {/* Uptime & User Info */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-cyber-border/20">
        <div>
          <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted uppercase">
            ACTIVE USER
          </div>
          <div className="text-xs font-bold text-cyber-text flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-cyber-glow" />
            <span>Sourabh Sahu</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted uppercase">
            SYSTEM UPTIME
          </div>
          <div className="text-xs font-mono font-bold text-cyber-glow mt-0.5">
            {uptime}
          </div>
        </div>
      </div>
    </div>
  );
}
