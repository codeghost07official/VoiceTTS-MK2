import React from 'react';
import { X, Play, Download, Trash2, Clock, Radio } from 'lucide-react';
import { AudioClip } from '../types';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clips: AudioClip[];
  onPlayClip: (clip: AudioClip) => void;
  onDownloadClip: (clip: AudioClip) => void;
  onClearArchive: () => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  clips,
  onPlayClip,
  onDownloadClip,
  onClearArchive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#040712] border-l border-white/20 p-5 sm:p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-[0.25em] font-mono">
              AUDIO ARCHIVE // <span className="text-[#00F5FF]">MK2</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
            title="Close archive drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {clips.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-mono text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-[#00F5FF]/40" />
              <span className="font-semibold text-slate-300">NO SYNTHESIZED CLIPS RECORDED</span>
              <p className="mt-2 text-[10px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                Audio synthesized with VOICE TTS MK2 is automatically cached here for instantaneous re-play and WAV export.
              </p>
            </div>
          ) : (
            clips.map((clip) => (
              <div
                key={clip.id}
                className="p-4 bg-white/5 border border-white/15 hover:border-[#00F5FF]/50 transition-colors rounded-xs shadow-sm"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mb-2">
                  <span className="text-[#00F5FF] font-bold uppercase">{clip.voiceName}</span>
                  <span className="text-slate-400">{new Date(clip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <p className="text-xs text-white line-clamp-2 mb-3 font-normal leading-relaxed">
                  "{clip.text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono text-slate-300">
                  <span className="font-semibold">SPEED: {clip.speed.toFixed(2)}x</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayClip(clip)}
                      className="px-3 py-1.5 min-h-[32px] bg-[#00F5FF]/15 text-[#00F5FF] hover:bg-[#00F5FF]/30 border border-[#00F5FF]/50 flex items-center gap-1.5 transition-colors uppercase tracking-wider text-[9px] font-bold rounded-xs"
                      title="Play clip"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>PLAY</span>
                    </button>
                    <button
                      onClick={() => onDownloadClip(clip)}
                      className="px-3 py-1.5 min-h-[32px] bg-white/10 text-white hover:bg-[#00F5FF]/15 hover:text-[#00F5FF] hover:border-[#00F5FF]/50 border border-white/20 flex items-center gap-1.5 transition-colors uppercase tracking-wider text-[9px] font-semibold rounded-xs"
                      title="Download WAV"
                    >
                      <Download className="w-3 h-3" />
                      <span>WAV</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {clips.length > 0 && (
          <div className="pt-4 border-t border-white/15 flex justify-between items-center text-xs font-mono">
            <span className="text-[10px] text-slate-300 font-semibold">{clips.length} CLIPS STORED</span>
            <button
              onClick={onClearArchive}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px] uppercase tracking-wider transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR ARCHIVE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


