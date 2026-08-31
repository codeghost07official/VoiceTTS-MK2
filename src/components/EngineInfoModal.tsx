import React from 'react';
import { X, Cpu, Shield, Zap, Music, Radio, CheckCircle2 } from 'lucide-react';

interface EngineInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineInfoModal: React.FC<EngineInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#040712] border border-white/20 p-5 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto rounded-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
          title="Close specifications modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6 pb-4 border-b border-white/15">
          <div className="text-[10px] text-[#00F5FF] uppercase tracking-[0.3em] font-mono mb-1 font-semibold">
            SPECIFICATION & ARCHITECTURE
          </div>
          <h2 className="font-mono font-bold text-lg sm:text-xl text-white uppercase tracking-wider">
            VOICE TTS <span className="text-[#00F5FF]">MK2</span> SYNTHESIS ENGINE
          </h2>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs font-mono">
          <div className="p-4 bg-white/5 border border-white/15 rounded-xs">
            <div className="flex items-center gap-2 text-[#00F5FF] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              <Zap className="w-4 h-4" />
              <span>SYNTHESIS PIPELINE</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Direct neural speech acoustic synthesis pipeline with deep-learning voice timbre modeling and multi-rate speech sampling.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xs">
            <div className="flex items-center gap-2 text-[#C5A059] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              <Music className="w-4 h-4" />
              <span>AUDIO EXPORT FORMAT</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Studio-grade 44,100 Hz, 16-Bit Linear PCM WAV files generated instantly in memory with full waveform integrity.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xs">
            <div className="flex items-center gap-2 text-[#00F5FF] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              <Shield className="w-4 h-4" />
              <span>SECURITY & PRIVACY</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Real-time processing with zero audio data retention. Speech synthesis is isolated to active sessions with direct client download.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xs">
            <div className="flex items-center gap-2 text-white font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              <Radio className="w-4 h-4 text-[#00F5FF]" />
              <span>COSMIC SHADER UNIVERSE</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              GPU-accelerated procedural particle field with WebGL/WebGPU support, responsive viewport scaling, and real-time audio spectrum visualization.
            </p>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="space-y-2.5 mb-6 font-mono text-xs text-slate-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5FF] shrink-0" />
            <span>Multi-gender voice matrix: Male, Female, and Synthetic natural profiles</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5FF] shrink-0" />
            <span>Precise velocity modulation from 1.0x to 2.0x with smooth pitch compensation</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5FF] shrink-0" />
            <span>Real-time spectral oscilloscope and live frequency analyser</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00F5FF] shrink-0" />
            <span>Responsive layout preview modes: Desktop PC, Tablet, and Mobile Phone</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="flex justify-end pt-4 border-t border-white/15">
          <button
            onClick={onClose}
            className="h-10 px-6 bg-[#00F5FF] text-[#020305] font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#38f8ff] transition-colors rounded-xs shadow-md"
          >
            CLOSE SPECS
          </button>
        </div>
      </div>
    </div>
  );
};


