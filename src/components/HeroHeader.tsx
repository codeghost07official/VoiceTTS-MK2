import React from 'react';

export const HeroHeader: React.FC = () => {
  return (
    <div className="relative pt-4 sm:pt-6 pb-6 sm:pb-8 max-w-4xl mx-auto">
      {/* Top technical badge */}
      <div className="text-[10px] sm:text-xs font-bold text-[#C5A059] tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-3 flex items-center gap-2 font-mono">
        <span className="w-2.5 h-[1.5px] bg-[#C5A059]"></span>
        <span>VOICE TTS MK2 // NEURAL ACOUSTIC WORKSTATION</span>
      </div>

      {/* Cinematic Main Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05] mb-4 text-white">
        TURN WORDS<br />
        INTO <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00F5FF]">SOUND.</span>
      </h1>

      {/* Supporting description with crisp, high-contrast readability */}
      <p className="text-xs sm:text-sm md:text-base text-slate-200 tracking-wide max-w-xl font-normal leading-relaxed mb-6 drop-shadow-sm">
        Synthesize natural human speech from written language in studio-quality 16-bit 44.1 kHz PCM audio with precision voice profiles and instantaneous WAV export.
      </p>

      {/* Minimal technical telemetry metrics with crisp contrast */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[9px] sm:text-[10px] font-mono tracking-[0.15em] sm:tracking-[0.2em] text-slate-300 uppercase bg-white/5 border border-white/10 px-3.5 py-2 w-fit rounded-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse"></span>
          <span>FREQ: <strong className="text-white font-semibold">44.1 KHZ</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
          <span>FORMAT: <strong className="text-white font-semibold">WAV / PCM16</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>LATENCY: <strong className="text-white font-semibold">&lt; 120 MS</strong></span>
        </div>
      </div>
    </div>
  );
};


