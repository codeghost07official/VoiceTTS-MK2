import React, { useRef } from 'react';
import { Trash2, Copy, Check, Sparkles } from 'lucide-react';

interface TextWorkspaceProps {
  text: string;
  onChangeText: (text: string) => void;
  onClearText: () => void;
  disabled?: boolean;
}

const PRESET_SCRIPTS = [
  {
    title: 'Cosmic Echoes',
    content: 'The stars were not distant points of light, but vibrant echoes of a past we had yet to understand. In the silence of the void, every word carried the weight of a thousand suns.',
  },
  {
    title: 'Observatory MK2',
    content: 'Observatory Log MK2. We are receiving coherent resonance across the Sagittarius arm. Gravitational acoustic waveforms verified at forty-four point one kilohertz. Systems fully nominal.',
  },
  {
    title: 'Interstellar Voyage',
    content: 'This is a message from a distant world. We step out of our solar system into the universe seeking only peace and friendship. To all who listen across the stars: you are not alone.',
  },
  {
    title: 'Neural Protocol',
    content: 'Initiating neural voice telemetry matrix. Frequency carrier locks in three, two, one. Acoustic spectrum synthesized with zero loss across deep-space transmission channels.',
  },
];

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({
  text,
  onChangeText,
  onClearText,
  disabled = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleApplyPreset = (presetContent: string) => {
    onChangeText(presetContent);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6 sm:mb-8">
      {/* Corner Bracket Accents */}
      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#00F5FF]/80 pointer-events-none z-10"></div>
      <div className="absolute -bottom-2.5 -right-2.5 w-6 h-6 border-b-2 border-r-2 border-[#00F5FF]/80 pointer-events-none z-10"></div>

      {/* Main Container Panel with solid backdrop to prevent background particle interference */}
      <div className="w-full bg-[#060913]/90 backdrop-blur-xl border border-white/15 p-4 sm:p-6 md:p-8 flex flex-col relative transition-all shadow-xl shadow-black/40 rounded-xs">
        
        {/* Header Telemetry */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex gap-4 sm:gap-8 items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-[#00F5FF] uppercase tracking-widest font-mono font-semibold">Chars</span>
              <span className="text-xs sm:text-sm font-mono text-white font-medium">{characterCount} <span className="text-slate-400 text-[10px]">/ 5000</span></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-[#00F5FF] uppercase tracking-widest font-mono font-semibold">Words</span>
              <span className="text-xs sm:text-sm font-mono text-white font-medium">{wordCount}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-[#C5A059] uppercase tracking-widest font-mono font-semibold">Est. Duration</span>
              <span className="text-xs sm:text-sm font-mono text-[#C5A059] font-medium">~{Math.max(1, Math.round(wordCount * 0.35))}s</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-mono hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]"></span>
            <span>STREAM: TEXT_TO_PCM</span>
          </div>
        </div>

        {/* Text Input Area with bright readability */}
        <textarea
          ref={textareaRef}
          id="tts-text-input"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={disabled}
          placeholder="Enter text to synthesize speech..."
          spellCheck={false}
          rows={5}
          className="w-full bg-transparent resize-y min-h-[140px] max-h-[380px] border-none outline-none text-base sm:text-lg md:text-xl font-normal tracking-wide text-white placeholder:text-slate-400/70 leading-relaxed font-sans focus:ring-0 selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]"
        />

        {/* Footer of Editor: Presets & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-3 border-t border-white/10 text-[10px] font-mono">
          
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-300 font-semibold mr-1">PRESETS:</span>
            {PRESET_SCRIPTS.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-btn-${idx}`}
                type="button"
                onClick={() => handleApplyPreset(preset.content)}
                disabled={disabled}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-[#00F5FF] border border-white/15 hover:border-[#00F5FF]/50 transition-colors uppercase tracking-wider text-[9px] font-mono active:scale-95"
                title={preset.content}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Action Tools: Clear and Copy */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="clear-text-btn"
              type="button"
              onClick={onClearText}
              disabled={disabled || !text}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-transparent hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 border border-white/15 hover:border-rose-500/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider text-[9px] font-mono"
              title="Clear text buffer"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>CLEAR</span>
            </button>

            <button
              id="copy-text-btn"
              type="button"
              onClick={handleCopy}
              disabled={disabled || !text}
              className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] bg-white/5 hover:bg-[#00F5FF]/15 text-slate-200 hover:text-[#00F5FF] border border-white/15 hover:border-[#00F5FF]/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider text-[9px] font-mono font-medium"
              title="Copy text to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-[#00F5FF]" /> : <Copy className="w-3 h-3 text-[#00F5FF]" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

