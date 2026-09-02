import React from 'react';
import { X, Youtube, Chrome, Code2, Music, MessageCircle, Calculator, Folder, Camera, Settings, Smartphone, Monitor } from 'lucide-react';

const PC_APPS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', desc: 'Video Streaming & Search' },
  { id: 'chrome', name: 'Google Chrome', icon: Chrome, color: 'text-yellow-400', desc: 'Web Browser' },
  { id: 'vscode', name: 'Visual Studio Code', icon: Code2, color: 'text-blue-400', desc: 'Code Editor & IDE' },
  { id: 'spotify', name: 'Spotify Web', icon: Music, color: 'text-green-400', desc: 'Music & Podcasts' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-cyan-400', desc: 'System Calculator' },
  { id: 'file_manager', name: 'File Explorer', icon: Folder, color: 'text-amber-400', desc: 'Windows File Manager' },
];

const PHONE_APPS = [
  { id: 'whatsapp_papaji', name: 'WhatsApp Papaji', icon: MessageCircle, color: 'text-emerald-400', desc: 'Video Call to Papaji', isPhone: true, action: 'whatsapp', target: 'papaji' },
  { id: 'whatsapp_mummy', name: 'WhatsApp Mummy', icon: MessageCircle, color: 'text-emerald-400', desc: 'WhatsApp Call to Mummy', isPhone: true, action: 'whatsapp', target: 'mummy' },
  { id: 'phone_youtube', name: 'YouTube (Phone)', icon: Youtube, color: 'text-red-400', desc: 'Launch on POCO M3 Pro', isPhone: true, action: 'phone_app', target: 'youtube' },
  { id: 'phone_camera', name: 'Camera (Phone)', icon: Camera, color: 'text-cyan-400', desc: 'Open Camera on Phone', isPhone: true, action: 'phone_app', target: 'camera' },
  { id: 'phone_screenshot', name: 'Screenshot', icon: Smartphone, color: 'text-purple-400', desc: 'Capture Phone Screen', isPhone: true, action: 'phone_utility', target: 'screenshot' },
  { id: 'phone_lock', name: 'Lock Screen', icon: Settings, color: 'text-rose-400', desc: 'Lock POCO Screen', isPhone: true, action: 'phone_utility', target: 'lock' },
];

export function AppsCatalogModal({ onClose, onLaunch }) {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-cyber-glow/50 shadow-neon-cyan overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border/40 bg-[#061536]/90">
          <div>
            <h3 className="text-base font-orbitron font-bold tracking-wider text-cyber-glow">
              APPLICATION LAUNCHER CATALOG
            </h3>
            <p className="text-[10px] font-rajdhani font-semibold text-cyber-muted tracking-wider">
              PC AUTOMATION & POCO M3 PRO 5G WIRELESS CONTROLS
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* PC Applications Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-rajdhani font-bold tracking-widest text-cyber-glow uppercase mb-3">
              <Monitor className="w-4 h-4" />
              <span>DESKTOP PC APPLICATIONS</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PC_APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      if (onLaunch) onLaunch(app.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#061530]/80 border border-cyber-border/30 hover:border-cyber-glow/60 hover:bg-[#09224c] flex items-center gap-3 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#040d20] border border-cyber-border/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${app.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-cyber-text group-hover:text-cyber-glow">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-cyber-muted">
                        {app.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Phone Applications Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-rajdhani font-bold tracking-widest text-cyber-green uppercase mb-3">
              <Smartphone className="w-4 h-4" />
              <span>POCO M3 PRO 5G (WIRELESS ADB APPS)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PHONE_APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      if (onLaunch) onLaunch(app.id, app.target);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#061530]/80 border border-cyber-green/30 hover:border-cyber-green hover:bg-[#092b3a] flex items-center gap-3 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#04121a] border border-cyber-green/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${app.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-cyber-text group-hover:text-cyber-green">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-cyber-muted">
                        {app.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-border/30 bg-[#051026] flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyber-muted">
            Click any application tile to trigger instant launch
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
