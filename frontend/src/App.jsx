import React, { useState, useCallback, useRef } from 'react';
import { Scene3D } from './components/3d/Scene3D';
import { TopNav } from './components/hud/TopNav';
import { LocationCard } from './components/hud/LocationCard';
import { SystemStatusCard } from './components/hud/SystemStatusCard';
import { QuickAppsCard } from './components/hud/QuickAppsCard';
import { ActivityMonitor } from './components/hud/ActivityMonitor';
import { SystemInfoCard } from './components/hud/SystemInfoCard';
import { VoiceCommandsCard } from './components/hud/VoiceCommandsCard';
import { AIChatCard } from './components/hud/AIChatCard';
import { SystemLogCard } from './components/hud/SystemLogCard';
import { VoiceControlBar } from './components/hud/VoiceControlBar';
import { QuickActionsBar } from './components/hud/QuickActionsBar';
import { StatusBar } from './components/hud/StatusBar';
import { AboutModal } from './components/hud/AboutModal';
import { AppsCatalogModal } from './components/hud/AppsCatalogModal';
import { ToolsModal } from './components/hud/ToolsModal';
import { SettingsModal } from './components/hud/SettingsModal';
import { MarkdownRenderer } from './components/hud/MarkdownRenderer';
import { useWebSocket } from './hooks/useWebSocket';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useVoiceSpeaker } from './hooks/useVoiceSpeaker';
import { X, Send, Bot, Smartphone, Plus, Paperclip, FileText, Sparkles } from 'lucide-react';

export default function App() {
  const [voiceMode, setVoiceMode] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [activeModal, setActiveModal] = useState(null); // null | 'ABOUT' | 'APPS' | 'TOOLS' | 'SETTINGS' | 'CHAT'
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello Sourabh! I am JARVIS. How can I assist you today? You can attach files to summarize, generate quizzes, or ask technical questions!' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // { filename, file_type, size, content }

  const chatFileInputRef = useRef(null);
  const voiceSpeaker = useVoiceSpeaker();
  const { speak } = voiceSpeaker;

  // Auto-sync persistent settings on startup
  React.useEffect(() => {
    const savedKey = localStorage.getItem('jarvis_gemini_key');
    const savedPhoneIp = localStorage.getItem('jarvis_phone_ip');
    const savedPhonePin = localStorage.getItem('jarvis_phone_pin');
    if (savedKey || savedPhoneIp || savedPhonePin) {
      fetch('http://127.0.0.1:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: savedKey,
          phone_ip: savedPhoneIp,
          phone_pin: savedPhonePin
        })
      }).catch(() => {});
    }
  }, []);

  // File Processor Helper
  const processUploadedFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    const isText = file.type.startsWith('text/') || 
                   file.name.endsWith('.py') || 
                   file.name.endsWith('.js') || 
                   file.name.endsWith('.json') || 
                   file.name.endsWith('.csv') || 
                   file.name.endsWith('.md') || 
                   file.name.endsWith('.html') || 
                   file.name.endsWith('.css') || 
                   file.name.endsWith('.txt');

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;

    reader.onload = (e) => {
      const content = e.target?.result || `Binary or structured file: ${file.name}`;
      setAttachedFile({
        filename: file.name,
        file_type: file.type || 'text/plain',
        size: sizeFormatted,
        content: typeof content === 'string' ? content : `File ${file.name} metadata attached.`
      });
      setActiveModal('CHAT');
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // WebSocket Handlers
  const handleCommandResult = useCallback((payload) => {
    const result = payload.result || {};
    const spoken = result.spoken_summary || result.spoken_response || "Command executed, sir.";
    const markdown = result.detailed_markdown || spoken;

    setSpokenResponse(spoken);
    setVoiceMode('speaking');

    // Add assistant response to chat message stream
    if (markdown) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: markdown }
      ]);
      // If result is CHAT/WEB_SEARCH/FILE_ANALYSIS, display in Chat modal
      if (result.intent && result.intent !== 'COMMAND') {
        setActiveModal('CHAT');
      }
    }

    // Speak audio aloud via browser TTS
    speak(spoken, () => {
      setVoiceMode('idle');
    });
  }, [speak]);

  const handleActionResult = useCallback((payload) => {
    const spoken = payload.result?.spoken_summary || payload.result?.spoken || "Action executed, sir.";
    setSpokenResponse(spoken);
    setVoiceMode('speaking');
    speak(spoken, () => {
      setVoiceMode('idle');
    });
  }, [speak]);

  const { isConnected, telemetry, activities, sendAction, sendVoiceCommand } = useWebSocket({
    onCommandResult: handleCommandResult,
    onActionResult: handleActionResult
  });

  // Speech Recognition Handler
  const handleFinalTranscript = useCallback((finalText) => {
    if (!finalText.trim()) return;
    setLiveTranscript(finalText);
    setVoiceMode('processing');
    
    // Pass attached file and history slice
    const historySlice = chatMessages.slice(-8).map(m => ({ role: m.role, text: m.text }));
    sendVoiceCommand(finalText, attachedFile, historySlice);
  }, [sendVoiceCommand, attachedFile, chatMessages]);

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
    onFinalTranscript: handleFinalTranscript
  });

  // Update live transcript while speaking
  React.useEffect(() => {
    if (isListening && transcript) {
      setLiveTranscript(transcript);
    }
  }, [isListening, transcript]);

  // Toggle Microphone
  const toggleMic = () => {
    if (isListening || voiceMode === 'listening') {
      stopListening();
      setVoiceMode('idle');
    } else {
      setLiveTranscript('');
      setSpokenResponse('');
      setVoiceMode('listening');
      startListening();
    }
  };

  const handleLaunchApp = (appId, target = '') => {
    sendAction(appId, target);
  };

  const handleTriggerCommand = (action, target) => {
    sendAction(action, target);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'system_tools') {
      setActiveModal('TOOLS');
    } else if (actionId === 'file_manager') {
      // Open file selector in addition to explorer
      if (chatFileInputRef.current) {
        chatFileInputRef.current.click();
      }
      sendAction('file_manager');
    } else if (actionId === 'web_search') {
      sendAction('web_search', 'AI News');
    } else if (actionId === 'settings') {
      setActiveModal('SETTINGS');
    } else if (actionId === 'shutdown') {
      sendAction('phone_utility', 'lock');
    } else {
      sendAction(actionId);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'ABOUT') setActiveModal('ABOUT');
    else if (tab === 'APPS') setActiveModal('APPS');
    else if (tab === 'TOOLS') setActiveModal('TOOLS');
    else if (tab === 'SETTINGS') setActiveModal('SETTINGS');
    else setActiveModal(null);
  };

  const handleOpenChatModal = (initialPrompt = '') => {
    setActiveModal('CHAT');
    if (initialPrompt) {
      const newMsgs = [...chatMessages, { role: 'user', text: initialPrompt }];
      setChatMessages(newMsgs);
      const historySlice = newMsgs.slice(-8).map(m => ({ role: m.role, text: m.text }));
      sendVoiceCommand(initialPrompt, attachedFile, historySlice);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() && !attachedFile) return;
    const userText = inputMsg || (attachedFile ? `Analyze this file: ${attachedFile.filename}` : '');
    const currentFile = attachedFile;
    const isImg = currentFile?.content?.startsWith('data:image/') || currentFile?.filename?.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);
    
    setInputMsg('');
    setAttachedFile(null); // Clear active attachment chip after sending

    const newMsgs = [
      ...chatMessages, 
      { 
        role: 'user', 
        text: userText, 
        imagePreview: isImg ? currentFile.content : null,
        filename: currentFile?.filename
      }
    ];
    setChatMessages(newMsgs);
    const historySlice = newMsgs.slice(-8).map(m => ({ role: m.role, text: m.text }));
    sendVoiceCommand(userText, currentFile, historySlice);
  };

  const handleQuickPrompt = (promptText) => {
    const currentFile = attachedFile;
    const isImg = currentFile?.content?.startsWith('data:image/') || currentFile?.filename?.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);
    setAttachedFile(null);

    const newMsgs = [
      ...chatMessages, 
      { 
        role: 'user', 
        text: promptText,
        imagePreview: isImg ? currentFile?.content : null,
        filename: currentFile?.filename
      }
    ];
    setChatMessages(newMsgs);
    const historySlice = newMsgs.slice(-8).map(m => ({ role: m.role, text: m.text }));
    sendVoiceCommand(promptText, currentFile, historySlice);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#030712] font-sans">
      
      {/* Hidden Global File Picker */}
      <input
        type="file"
        ref={chatFileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processUploadedFile(file);
        }}
        className="hidden"
        accept=".txt,.pdf,.docx,.md,.py,.js,.json,.csv,.png,.jpg,.jpeg"
      />

      {/* ========================================================================= */}
      {/* LAYER 1: 3D WebGL Three.js Scene                                          */}
      {/* ========================================================================= */}
      <Scene3D mode={voiceMode} />

      {/* ========================================================================= */}
      {/* LAYER 2: Crisp Fixed Holographic HUD Overlay                              */}
      {/* ========================================================================= */}
      
      {/* Top Cyber Navigation Bar */}
      <TopNav
        activeTab={activeModal === 'CHAT' ? 'HOME' : (activeModal || 'HOME')}
        onTabChange={handleTabChange}
        phoneStatus={telemetry?.phone}
        isListening={isListening || voiceMode === 'listening'}
        onToggleMic={toggleMic}
        onOpenManualInput={() => handleOpenChatModal()}
      />

      {/* Main 3-Column Command Center Workspace */}
      <main className="flex-1 w-full grid grid-cols-[270px_1fr_270px] gap-4 px-6 py-3 min-h-0 z-10 pointer-events-none">
        
        {/* LEFT COLUMN: System Status, Location, Quick Apps, Activity Monitor */}
        <section className="flex flex-col gap-3 overflow-y-auto pr-1 pointer-events-auto">
          <LocationCard telemetry={telemetry} />
          <SystemStatusCard telemetry={telemetry} />
          <QuickAppsCard onLaunchApp={handleLaunchApp} />
          <ActivityMonitor activities={activities} />
        </section>

        {/* CENTER COLUMN: Central Holographic Typography, Voice Control, Quick Actions */}
        <section className="flex flex-col justify-between items-center text-center py-2 px-4 pointer-events-none">
          
          {/* Central Holographic Title Banner */}
          <div className="flex flex-col items-center mt-3 pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-orbitron font-extrabold tracking-[0.3em] text-cyber-glow neon-text-glow">
              JARVIS
            </h2>
            <p className="text-[11px] md:text-xs font-rajdhani font-bold tracking-[0.25em] text-cyber-text/80 uppercase mt-1">
              YOUR VOICE. YOUR COMMAND. YOUR ASSISTANT.
            </p>
          </div>

          {/* Spacer to let 3D Centerpiece breathe */}
          <div className="flex-1 min-h-[140px]" />

          {/* Bottom-Center Interactive Controls */}
          <div className="w-full flex flex-col gap-4 pointer-events-auto">
            {/* Real-Time Voice Waveform & Live Transcription Bar */}
            <VoiceControlBar
              mode={voiceMode}
              liveTranscript={liveTranscript}
              spokenResponse={spokenResponse}
              onToggleMic={toggleMic}
            />

            {/* 5 Floating Quick Action Buttons */}
            <QuickActionsBar onTriggerAction={handleQuickAction} />
          </div>
        </section>

        {/* RIGHT COLUMN: System Info, Voice Commands, AI Chat, System Log */}
        <section className="flex flex-col gap-3 overflow-y-auto pl-1 pointer-events-auto">
          <SystemInfoCard telemetry={telemetry} />
          <VoiceCommandsCard onTriggerCommand={handleTriggerCommand} />
          <AIChatCard 
            onOpenChatModal={handleOpenChatModal}
            onFileSelect={processUploadedFile}
          />
          <SystemLogCard telemetry={telemetry} />
        </section>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar isConnected={isConnected} />

      {/* ========================================================================= */}
      {/* HOLOGRAPHIC MODAL VIEWS (ABOUT, SETTINGS, APPS, TOOLS, AI CHAT)           */}
      {/* ========================================================================= */}
      
      {/* 1. Academic Credentials & About Modal */}
      {activeModal === 'ABOUT' && (
        <AboutModal onClose={() => setActiveModal(null)} />
      )}

      {/* 2. System Settings Modal (with Voice Gender / Persona Selector & Phone Unlock) */}
      {activeModal === 'SETTINGS' && (
        <SettingsModal 
          onClose={() => setActiveModal(null)}
          voiceSpeaker={voiceSpeaker}
          onTriggerAction={handleQuickAction}
        />
      )}

      {/* 3. Applications Catalog Modal */}
      {activeModal === 'APPS' && (
        <AppsCatalogModal
          onClose={() => setActiveModal(null)}
          onLaunch={handleLaunchApp}
        />
      )}

      {/* 4. System Diagnostics & Tools Modal */}
      {activeModal === 'TOOLS' && (
        <ToolsModal
          onClose={() => setActiveModal(null)}
          telemetry={telemetry}
          onTriggerAction={handleQuickAction}
        />
      )}

      {/* 5. AI Chat & Document Analysis Modal */}
      {activeModal === 'CHAT' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel rounded-2xl w-full max-w-2xl h-[580px] flex flex-col border border-cyber-glow/50 shadow-neon-cyan overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-border/40 bg-[#061536]/90">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-cyber-glow" />
                <div>
                  <h3 className="text-sm font-orbitron font-bold tracking-wider text-cyber-glow">
                    JARVIS AI INTELLIGENCE & DOCUMENT Q&A
                  </h3>
                  <p className="text-[10px] font-rajdhani font-semibold text-cyber-muted tracking-wider">
                    VOICE & TEXT MULTIMODAL REASONING
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyber-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body with Smooth Scrolling */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans smooth-scroll select-text">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-4 py-2.5 text-xs leading-relaxed select-text ${
                      msg.role === 'user'
                        ? 'bg-cyber-blue/40 border border-cyber-glow/50 text-white'
                        : 'bg-[#071738] border border-cyber-border/40 text-cyber-text shadow-card-glow'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="space-y-2">
                        {msg.imagePreview && (
                          <div className="rounded-lg overflow-hidden border border-cyber-glow/40 max-w-[220px] bg-black/40">
                            <img src={msg.imagePreview} alt="User Upload" className="w-full max-h-48 object-cover" />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap font-sans select-text">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attached File Preview Chip & Quick Actions */}
            {attachedFile && (
              <div className="px-4 py-2 bg-[#051126] border-t border-cyber-border/30 space-y-1.5">
                {/* File / Image Chip */}
                <div className="flex items-center justify-between bg-cyber-blue/20 border border-cyber-glow/40 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-cyber-glow truncate">
                    {attachedFile.content?.startsWith('data:image/') ? (
                      <img src={attachedFile.content} alt="Thumbnail" className="w-8 h-8 rounded object-cover border border-cyber-glow/60 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-cyber-glow shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="truncate">{attachedFile.filename}</div>
                      <div className="text-[10px] text-cyber-muted font-mono">{attachedFile.size}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachedFile(null)}
                    title="Remove attached file"
                    className="w-6 h-6 rounded-full hover:bg-rose-500/20 text-cyber-muted hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick One-Click Prompts for Attached File / Image */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {attachedFile.content?.startsWith('data:image/') ? (
                    <>
                      <button
                        onClick={() => handleQuickPrompt("Identify and describe what is in this image in detail.")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Identify & Describe Image</span>
                      </button>
                      <button
                        onClick={() => handleQuickPrompt("Whose image is this and what breed or object is shown?")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Identify Breed / Subject</span>
                      </button>
                      <button
                        onClick={() => handleQuickPrompt("Extract all visible text and details from this image.")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>OCR / Extract Text</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleQuickPrompt("Summarize this document and extract key points.")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Summarize File</span>
                      </button>
                      <button
                        onClick={() => handleQuickPrompt("Create a 5-question multiple choice quiz with answers based on this file.")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate Quiz</span>
                      </button>
                      <button
                        onClick={() => handleQuickPrompt("Explain the architecture, structure, and details of this document.")}
                        className="px-2.5 py-1 rounded-full bg-[#07193c] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/50 text-[10.5px] font-rajdhani font-bold text-cyber-glow whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Explain in Detail</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Message Input & + Attachment Button */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-cyber-border/30 bg-[#051026] flex items-center gap-2">
              {/* + Attachment Button */}
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                title="Attach Document / Media (+)"
                className="p-2 bg-[#071738] hover:bg-cyber-blue/40 border border-cyber-border/50 hover:border-cyber-glow rounded-xl text-cyber-muted hover:text-cyber-glow transition-all shrink-0 cursor-pointer shadow-card-glow"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={attachedFile ? `Ask anything about ${attachedFile.filename}...` : "Ask JARVIS or click + to upload a file..."}
                className="flex-1 bg-[#071738] border border-cyber-border/40 rounded-xl px-3.5 py-2 text-xs text-cyber-text placeholder:text-cyber-muted focus:outline-none focus:border-cyber-glow transition-all"
              />

              <button
                type="submit"
                className="p-2 bg-cyber-glow text-[#030712] rounded-xl font-bold hover:bg-white transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
