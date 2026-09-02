import React, { useState, useRef } from 'react';
import { MessageSquare, ChevronRight, Send, Paperclip, Plus } from 'lucide-react';

export function AIChatCard({ onOpenChatModal, onFileSelect }) {
  const [quickInput, setQuickInput] = useState('');
  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    if (onOpenChatModal) onOpenChatModal(quickInput);
    setQuickInput('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFileSelect) onFileSelect(file);
    if (onOpenChatModal) onOpenChatModal();
  };

  return (
    <div className="glass-panel rounded-xl p-3.5 relative">
      {/* Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-1.5">
        <span>AI CHAT & DOCS</span>
        <MessageSquare className="w-3.5 h-3.5 text-cyber-glow/60" />
      </div>

      {/* Description */}
      <div className="text-[11px] font-medium text-cyber-text mb-0.5">
        Ask me anything or analyze files...
      </div>
      <p className="text-[10px] text-cyber-muted leading-tight mb-2.5">
        Upload files to summarize, generate quizzes, or ask technical questions!
      </p>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.docx,.md,.py,.js,.json,.csv,.png,.jpg,.jpeg"
      />

      {/* Action / Input */}
      <form onSubmit={handleSend} className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file for AI analysis"
          className="p-1.5 bg-[#061430] hover:bg-cyber-blue/30 border border-cyber-border/40 hover:border-cyber-glow/60 rounded-lg text-cyber-muted hover:text-cyber-glow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Ask or summarize..."
          className="w-full bg-[#051128] border border-cyber-border/40 rounded-lg px-2.5 py-1 text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-glow transition-all"
        />
        
        <button
          type="submit"
          className="px-2.5 py-1 bg-cyber-blue/30 hover:bg-cyber-blue/60 border border-cyber-glow/60 rounded-lg text-cyber-glow hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>

      {/* Start Chat Button */}
      <button
        onClick={() => onOpenChatModal && onOpenChatModal()}
        className="w-full mt-2 py-1 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/40 border border-cyber-glow/40 text-[10.5px] font-rajdhani font-bold text-cyber-glow hover:text-white tracking-wider uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <span>START CHAT</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
