import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export function MarkdownRenderer({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process text into styled markdown blocks
  const renderFormattedBlocks = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = [];

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          const fullCode = codeContent.join('\n');
          elements.push(
            <CodeBlock key={`code-${index}`} code={fullCode} language={codeLanguage} />
          );
          inCodeBlock = false;
          codeContent = [];
          codeLanguage = '';
        } else {
          // Open code block
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'text';
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers (###, ##, #)
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-sm font-orbitron font-bold text-cyber-glow mt-3 mb-1.5 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }
      if (line.startsWith('#### ')) {
        elements.push(
          <h5 key={index} className="text-xs font-orbitron font-bold text-cyber-text mt-2.5 mb-1">
            {line.replace('#### ', '')}
          </h5>
        );
        return;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        elements.push(
          <h3 key={index} className="text-base font-orbitron font-extrabold text-cyber-glow mt-3 mb-1.5 border-b border-cyber-border/30 pb-1">
            {line.replace(/^#+\s/, '')}
          </h3>
        );
        return;
      }

      // Horizontal Divider
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="border-cyber-border/30 my-2.5" />);
        return;
      }

      // Blockquotes (> text)
      if (line.startsWith('> ')) {
        elements.push(
          <div key={index} className="border-l-2 border-cyber-glow bg-cyber-blue/10 px-3 py-1.5 rounded-r-lg my-1.5 text-xs text-cyber-text italic">
            {parseInlineMarkdown(line.replace('> ', ''))}
          </div>
        );
        return;
      }

      // Unordered Lists (* item, - item)
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().replace(/^[\*\-]\s+/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1 pl-1 text-xs text-cyber-text leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-glow shrink-0 mt-1.5 shadow-neon-cyan"></span>
            <div className="flex-1">{parseInlineMarkdown(itemText)}</div>
          </div>
        );
        return;
      }

      // Numbered Lists (1. item, 2. item)
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1 pl-1 text-xs text-cyber-text leading-relaxed">
            <span className="text-[11px] font-mono font-bold text-cyber-glow shrink-0 mt-0.5">{numMatch[1]}.</span>
            <div className="flex-1">{parseInlineMarkdown(numMatch[2])}</div>
          </div>
        );
        return;
      }

      // Empty line spacer
      if (!line.trim()) {
        elements.push(<div key={index} className="h-1.5" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={index} className="text-xs text-cyber-text leading-relaxed my-1 select-text">
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    // In case code block wasn't closed
    if (inCodeBlock && codeContent.length > 0) {
      elements.push(
        <CodeBlock key="code-final" code={codeContent.join('\n')} language={codeLanguage} />
      );
    }

    return elements;
  };

  // Parse inline Markdown links [Title](url), bold (**bold**), and code (`code`)
  const parseInlineMarkdown = (text) => {
    if (!text) return '';

    // Split by Markdown links [Title](url)
    const linkParts = text.split(/(\[[^\]]+\]\([^\)]+\))/g);

    return linkParts.map((lPart, li) => {
      const linkMatch = lPart.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={`link-${li}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-glow underline decoration-cyber-glow/50 hover:text-cyan-300 font-medium inline-flex items-center gap-0.5 mx-0.5 transition-colors cursor-pointer select-text"
          >
            <span>{linkMatch[1]}</span>
            <span className="text-[9px] opacity-75">↗</span>
          </a>
        );
      }

      // Split by inline code `...`
      const parts = lPart.split(/(`[^`]+`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={`${li}-${i}`} className="px-1.5 py-0.5 rounded bg-[#030914] border border-cyber-glow/30 font-mono text-[11px] text-cyber-glow mx-0.5 select-text">
              {part.slice(1, -1)}
            </code>
          );
        }

        // Split by bold **...**
        const boldParts = part.split(/(\*\*[^\*]+\*\*)/g);
        return boldParts.map((bPart, bi) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return (
              <strong key={`${li}-${i}-${bi}`} className="font-bold text-white select-text">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          return bPart;
        });
      });
    });
  };

  return (
    <div className="relative group/markdown select-text font-sans">
      {/* Top Right Copy All Button */}
      <button
        onClick={handleCopyAll}
        title="Copy complete response"
        className="absolute right-0 -top-1 opacity-0 group-hover/markdown:opacity-100 transition-opacity px-2 py-1 rounded bg-[#040d20] border border-cyber-border/50 hover:border-cyber-glow text-[10px] font-mono font-bold text-cyber-muted hover:text-cyber-glow flex items-center gap-1 cursor-pointer z-10 shadow-card-glow"
      >
        {copied ? <Check className="w-3 h-3 text-cyber-green" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? 'COPIED!' : 'COPY'}</span>
      </button>

      <div className="space-y-0.5 select-text">
        {renderFormattedBlocks(content)}
      </div>
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-cyber-border/40 bg-[#020714] overflow-hidden shadow-card-glow select-text">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#051126] border-b border-cyber-border/30 text-[10px] font-mono text-cyber-muted">
        <div className="flex items-center gap-1.5 text-cyber-glow">
          <Terminal className="w-3.5 h-3.5" />
          <span className="uppercase font-bold">{language || 'CODE'}</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          {codeCopied ? <Check className="w-3 h-3 text-cyber-green" /> : <Copy className="w-3 h-3" />}
          <span>{codeCopied ? 'COPIED' : 'COPY CODE'}</span>
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3 overflow-x-auto text-[11.5px] font-mono text-cyber-glow/95 leading-relaxed bg-[#030914] select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}
