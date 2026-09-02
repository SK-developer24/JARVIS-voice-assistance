import React, { useState, useEffect } from 'react';
import { X, Settings, Sliders, Volume2, Smartphone, Key, Lock, Save, Check, Play, UserCheck, Globe, Cpu } from 'lucide-react';

export function SettingsModal({ onClose, voiceSpeaker, onTriggerAction }) {
  const [phoneIp, setPhoneIp] = useState(() => localStorage.getItem('jarvis_phone_ip') || '10.199.161.165');
  const [phonePort, setPhonePort] = useState('5555');
  const [phonePin, setPhonePin] = useState(() => localStorage.getItem('jarvis_phone_pin') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('jarvis_gemini_key') || '');
  const [geminiModel, setGeminiModel] = useState(() => localStorage.getItem('jarvis_gemini_model') || 'gemini-1.5-flash');
  const [searchProvider, setSearchProvider] = useState(() => localStorage.getItem('jarvis_search_provider') || 'duckduckgo');
  const [searchApiKey, setSearchApiKey] = useState(() => localStorage.getItem('jarvis_search_api_key') || '');
  const [saved, setSaved] = useState(false);

  const selectedVoiceId = voiceSpeaker?.selectedVoiceId || 'default_male';
  const setSelectedVoiceId = voiceSpeaker?.setSelectedVoiceId || (() => {});
  const speechRate = voiceSpeaker?.speechRate || 1.05;
  const setSpeechRate = voiceSpeaker?.setSpeechRate || (() => {});
  const availableVoices = voiceSpeaker?.availableVoices || [];
  const testVoice = voiceSpeaker?.testVoice || (() => {});

  // Fetch current backend settings on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.gemini_api_key) setApiKey(data.gemini_api_key);
        if (data.gemini_model) setGeminiModel(data.gemini_model);
        if (data.search_provider) setSearchProvider(data.search_provider);
        if (data.search_api_key) setSearchApiKey(data.search_api_key);
        if (data.phone_ip) setPhoneIp(data.phone_ip);
        if (data.phone_pin) setPhonePin(data.phone_pin);
      })
      .catch(() => {});
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    
    // 1. Instant 0ms Optimistic Save
    setSaved(true);
    localStorage.setItem('jarvis_phone_ip', phoneIp);
    localStorage.setItem('jarvis_phone_pin', phonePin);
    localStorage.setItem('jarvis_gemini_key', apiKey);
    localStorage.setItem('jarvis_gemini_model', geminiModel);
    localStorage.setItem('jarvis_search_provider', searchProvider);
    localStorage.setItem('jarvis_search_api_key', searchApiKey);

    // 2. Non-blocking Async Background Sync to Backend
    try {
      fetch('http://127.0.0.1:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: apiKey,
          gemini_model: geminiModel,
          search_provider: searchProvider,
          search_api_key: searchApiKey,
          phone_ip: phoneIp,
          phone_pin: phonePin
        })
      }).catch(() => {});
    } catch (_) {}

    setTimeout(() => setSaved(false), 2500);
  };

  const handleVoiceTest = (voiceId = null) => {
    if (voiceId && voiceId !== selectedVoiceId) {
      setSelectedVoiceId(voiceId);
    }
    testVoice(voiceId, "All systems nominal. JARVIS voice synthesis is calibrated and ready for your command, sir.");
  };

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col border border-cyber-glow/50 shadow-neon-cyan overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border/30 flex items-center justify-between bg-[#051026]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-glow/10 border border-cyber-glow/30">
              <Settings className="w-5 h-5 text-cyber-glow" />
            </div>
            <div>
              <h2 className="text-base font-orbitron font-bold text-cyber-glow tracking-wider">
                CORE SYSTEM CONFIGURATION
              </h2>
              <p className="text-[10px] text-cyber-muted font-mono">
                Hardware Voice, AI Model, Web Search Providers & POCO ADB Bridge
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyber-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 smooth-scroll">
          
          {/* ========================================================================= */}
          {/* Section 1: Voice & Persona Customization                                  */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-[#061430]/70 border border-cyber-border/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-cyber-glow uppercase tracking-wider">
                <Volume2 className="w-4 h-4" />
                <span>ASSISTANT VOICE & PERSONA</span>
              </div>
              <button
                type="button"
                onClick={() => handleVoiceTest()}
                className="px-2.5 py-1 rounded bg-cyber-glow/10 hover:bg-cyber-glow/20 border border-cyber-glow/30 text-[10px] font-mono text-cyber-glow flex items-center gap-1 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>TEST AUDIO</span>
              </button>
            </div>

            {/* Persona Preset Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedVoiceId('default_male');
                  handleVoiceTest('default_male');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedVoiceId === 'default_male'
                    ? 'bg-cyber-glow/20 border-cyber-glow shadow-neon-cyan'
                    : 'bg-[#040d20] border-cyber-border/30 hover:border-cyber-glow/50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-cyber-text flex items-center gap-1.5">
                    <span>JARVIS / British Male</span>
                    {selectedVoiceId === 'default_male' && <UserCheck className="w-3.5 h-3.5 text-cyber-glow" />}
                  </div>
                  <div className="text-[10px] text-cyber-muted mt-0.5">
                    Deep, sophisticated tech persona
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-[9px] font-bold text-blue-400">
                  MALE
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedVoiceId('default_female');
                  handleVoiceTest('default_female');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedVoiceId === 'default_female'
                    ? 'bg-purple-500/20 border-purple-400 shadow-neon-cyan'
                    : 'bg-[#040d20] border-cyber-border/30 hover:border-purple-400/50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-cyber-text flex items-center gap-1.5">
                    <span>ZIRA / Natural Female</span>
                    {selectedVoiceId === 'default_female' && <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <div className="text-[10px] text-cyber-muted mt-0.5">
                    Crisp, friendly assistant persona
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-[9px] font-bold text-purple-400">
                  FEMALE
                </span>
              </button>
            </div>

            {/* Custom Browser Voice Selector */}
            {availableVoices.length > 0 && (
              <div>
                <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                  ALL INSTALLED SYSTEM VOICES
                </label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => {
                    setSelectedVoiceId(e.target.value);
                    handleVoiceTest(e.target.value);
                  }}
                  className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-cyber-glow"
                >
                  <option value="default_male">British Male (JARVIS Default)</option>
                  <option value="default_female">Microsoft Zira (Female Default)</option>
                  {availableVoices.map((v, i) => (
                    <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-rajdhani font-bold text-cyber-muted uppercase mb-1">
                <span>SPEECH SYNTHESIS SPEED ({speechRate}x)</span>
                <span className="text-cyber-glow font-mono">{Math.round(speechRate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-cyber-glow cursor-pointer"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 2: Generative AI Model & Web Search Providers                    */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-[#061430]/70 border border-cyber-border/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-amber-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>GOOGLE GEMINI LLM & MODEL CONFIGURATION</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                  GEMINI MODEL ENDPOINT
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-amber-400"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen)</option>
                  <option value="gemini-pro">gemini-pro (Legacy)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                  GEMINI API KEY
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini key (AIzaSy...)"
                  className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-cyber-border/20">
              <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-wider mb-3">
                <Globe className="w-4 h-4" />
                <span>GENERAL WEB SEARCH PROVIDER & RAG</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                    SEARCH ENGINE PROVIDER
                  </label>
                  <select
                    value={searchProvider}
                    onChange={(e) => setSearchProvider(e.target.value)}
                    className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="duckduckgo">DuckDuckGo Organic (Free / No Key Required)</option>
                    <option value="tavily">Tavily AI Search (Key Required)</option>
                    <option value="serper">Google Serper API (Key Required)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                    SEARCH API KEY (OPTIONAL)
                  </label>
                  <input
                    type="password"
                    value={searchApiKey}
                    onChange={(e) => setSearchApiKey(e.target.value)}
                    placeholder="Tavily / Serper API key (if applicable)"
                    className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Section 3: Wireless Phone Bridge & Screen Auto-Unlock                     */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-[#061430]/70 border border-cyber-border/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-cyber-green uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>POCO M3 PRO 5G WIRELESS BRIDGE & UNLOCK</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-rajdhani font-bold text-cyber-muted uppercase block mb-1">
                  PHONE IP (HOTSPOT GATEWAY)
                </label>
                <input
                  type="text"
                  value={phoneIp}
                  onChange={(e) => setPhoneIp(e.target.value)}
                  placeholder="Auto-discovered IP"
                  className="w-full bg-[#040d20] border border-cyber-border/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-cyber-glow"
                />
              </div>

              <div>
                <label className="text-[10px] font-rajdhani font-bold text-cyber-green uppercase block mb-1">
                  LOCK SCREEN PIN (FOR AUTO-UNLOCK)
                </label>
                <input
                  type="password"
                  value={phonePin}
                  onChange={(e) => setPhonePin(e.target.value)}
                  placeholder="e.g. 1234 (Your phone PIN)"
                  className="w-full bg-[#040d20] border border-cyber-green/40 rounded-lg px-3 py-1.5 text-xs text-cyber-text font-mono focus:outline-none focus:border-cyber-green"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-border/30 bg-[#051026] flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyber-muted">
            Preferences auto-persist permanently across restarts
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-rajdhani font-bold text-cyber-muted hover:text-white transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-cyber-glow text-[#030712] font-bold text-xs font-rajdhani tracking-wider hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer shadow-neon-cyan"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saved ? "SAVED SUCCESSFULLY!" : "SAVE PREFERENCES"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
