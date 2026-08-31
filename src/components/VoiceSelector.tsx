import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Sparkles, Check, Search } from 'lucide-react';
import { VoiceOption } from '../types';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoiceId: string;
  onSelectVoice: (voice: VoiceOption) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female' | 'synthetic'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVoices = voices.filter((v) => {
    if (activeTab !== 'all' && v.gender !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.langLabel.toLowerCase().includes(q) ||
        (v.accent && v.accent.toLowerCase().includes(q)) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const maleCount = voices.filter((v) => v.gender === 'male').length;
  const femaleCount = voices.filter((v) => v.gender === 'female').length;
  const syntheticCount = voices.filter((v) => v.gender === 'synthetic').length;

  return (
    <div className="relative w-full flex flex-col gap-2" ref={dropdownRef}>
      {/* Label and Count */}
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-slate-300 uppercase tracking-[0.25em] font-mono font-semibold">
          Voice Profile
        </label>
        <span className="text-[9px] font-mono text-[#00F5FF] uppercase tracking-wider font-semibold">
          {voices.length} VOICES
        </span>
      </div>

      {/* Main Trigger Button */}
      <button
        id="voice-dropdown-trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] bg-[#070c18]/95 border border-white/20 flex items-center justify-between px-4 cursor-pointer hover:border-[#00F5FF]/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left shadow-md shadow-black/30 rounded-xs"
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0 pr-2">
          <div className="w-7 h-7 border border-[#00F5FF]/40 flex items-center justify-center shrink-0 bg-[#00F5FF]/10">
            {selectedVoice?.gender === 'synthetic' ? (
              <Sparkles className="w-3.5 h-3.5 text-[#00F5FF]" />
            ) : (
              <User className="w-3.5 h-3.5 text-[#00F5FF]" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-mono tracking-wider uppercase text-white font-bold truncate">
              {selectedVoice?.gender.toUpperCase()} // {selectedVoice?.name}
            </span>
            <span className="text-[10px] text-slate-300 truncate">
              {selectedVoice?.langLabel} &bull; {selectedVoice?.accent || 'Neural'}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-[#00F5FF] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Voice Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#040813] border border-white/25 shadow-2xl p-3 sm:p-4 backdrop-blur-2xl max-h-[380px] flex flex-col rounded-xs">
          {/* Category Tabs & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3 mb-3">
            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 tracking-wider uppercase transition-colors rounded-xs ${
                  activeTab === 'all'
                    ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold'
                    : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
                }`}
              >
                ALL ({voices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('male')}
                className={`px-2.5 py-1 tracking-wider uppercase transition-colors rounded-xs ${
                  activeTab === 'male'
                    ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold'
                    : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
                }`}
              >
                MALE ({maleCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('female')}
                className={`px-2.5 py-1 tracking-wider uppercase transition-colors rounded-xs ${
                  activeTab === 'female'
                    ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold'
                    : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
                }`}
              >
                FEMALE ({femaleCount})
              </button>
              {syntheticCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('synthetic')}
                  className={`px-2.5 py-1 tracking-wider uppercase transition-colors rounded-xs ${
                    activeTab === 'synthetic'
                      ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold'
                      : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
                  }`}
                >
                  SYNTH ({syntheticCount})
                </button>
              )}
            </div>

            {/* Search Filter Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search voices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 px-2.5 py-1 pl-6 text-[10px] text-white placeholder-slate-400 focus:outline-none focus:border-[#00F5FF] w-32 sm:w-36 font-mono rounded-xs"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
            </div>
          </div>

          {/* Voice List Scroll Area */}
          <div className="overflow-y-auto space-y-1 pr-1 flex-1 max-h-[260px]">
            {filteredVoices.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                NO MATCHING VOICES FOUND
              </div>
            ) : (
              filteredVoices.map((voice) => {
                const isSelected = voice.id === selectedVoiceId;
                return (
                  <button
                    key={voice.id}
                    id={`voice-option-${voice.id}`}
                    type="button"
                    onClick={() => {
                      onSelectVoice(voice);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 min-h-[46px] flex items-center justify-between text-left transition-colors border rounded-xs ${
                      isSelected
                        ? 'bg-[#00F5FF]/15 border-[#00F5FF]/60 text-white font-semibold'
                        : 'bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-white truncate">
                            {voice.gender.toUpperCase()} // {voice.name}
                          </span>
                          {voice.category === 'neural' && (
                            <span className="px-1.5 py-0.2 text-[8px] font-mono text-[#C5A059] border border-[#C5A059]/40 bg-[#C5A059]/10 font-bold shrink-0">
                              NEURAL
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-300 truncate mt-0.5">
                          {voice.description || voice.langLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#00F5FF]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};


