import React from 'react';
import { Layers, History, Cpu, Monitor, Tablet, Smartphone } from 'lucide-react';
import { DevicePreviewMode } from '../types';

interface NavbarProps {
  onOpenArchive: () => void;
  onOpenSpecs: () => void;
  onOpenVoices: () => void;
  archiveCount: number;
  deviceMode: DevicePreviewMode;
  onChangeDeviceMode: (mode: DevicePreviewMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenArchive,
  onOpenSpecs,
  onOpenVoices,
  archiveCount,
  deviceMode,
  onChangeDeviceMode,
}) => {
  return (
    <header className="relative z-20 w-full border-b border-white/10 bg-[#04060b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4.5rem] py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Left */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 border border-[#00F5FF]/80 flex items-center justify-center shrink-0 bg-[#00F5FF]/5 shadow-[0_0_10px_rgba(0,245,255,0.2)]">
            <div className="w-3.5 h-3.5 bg-[#00F5FF] animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white font-mono">
              VOICE TTS <span className="text-[#00F5FF]">MK2</span>
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] text-[#00F5FF] border border-[#00F5FF]/40 bg-[#00F5FF]/10 font-semibold">
              NEURAL ENGINE
            </span>
          </div>
        </div>

        {/* Device Mode Switcher (PC / TAB / PHONE) */}
        <div className="order-3 sm:order-2 flex items-center gap-1 bg-white/5 border border-white/15 p-1 rounded-sm">
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest px-1.5 hidden sm:inline-block">
            DEVICE
          </span>
          <button
            id="device-mode-pc"
            type="button"
            onClick={() => onChangeDeviceMode(deviceMode === 'pc' ? 'auto' : 'pc')}
            title="Desktop Composition (Wide View)"
            className={`px-2 py-1 flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase transition-all ${
              deviceMode === 'pc'
                ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold shadow-[0_0_8px_rgba(0,245,255,0.25)]'
                : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>PC</span>
          </button>

          <button
            id="device-mode-tab"
            type="button"
            onClick={() => onChangeDeviceMode(deviceMode === 'tab' ? 'auto' : 'tab')}
            title="Tablet Composition (Balanced View)"
            className={`px-2 py-1 flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase transition-all ${
              deviceMode === 'tab'
                ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold shadow-[0_0_8px_rgba(0,245,255,0.25)]'
                : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
            }`}
          >
            <Tablet className="w-3 h-3" />
            <span>TAB</span>
          </button>

          <button
            id="device-mode-phone"
            type="button"
            onClick={() => onChangeDeviceMode(deviceMode === 'phone' ? 'auto' : 'phone')}
            title="Phone Composition (Mobile-Optimized Single Column)"
            className={`px-2 py-1 flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase transition-all ${
              deviceMode === 'phone'
                ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold shadow-[0_0_8px_rgba(0,245,255,0.25)]'
                : 'text-slate-300 hover:text-white border border-transparent hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>PHONE</span>
          </button>
        </div>

        {/* Right Nav Action Buttons */}
        <nav className="order-2 sm:order-3 flex items-center gap-4 sm:gap-6 text-[10px] font-medium tracking-[0.2em] uppercase">
          <button
            id="nav-engine-btn"
            onClick={onOpenSpecs}
            className="text-slate-300 hover:text-[#00F5FF] transition-colors flex items-center gap-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00F5FF]"
          >
            <Cpu className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span className="font-mono">SPECS</span>
          </button>

          <button
            id="nav-voices-btn"
            onClick={onOpenVoices}
            className="text-slate-300 hover:text-[#00F5FF] transition-colors flex items-center gap-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00F5FF]"
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="font-mono">VOICES</span>
          </button>

          <button
            id="nav-archive-btn"
            onClick={onOpenArchive}
            className="relative text-slate-300 hover:text-[#00F5FF] transition-colors flex items-center gap-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00F5FF]"
          >
            <History className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span className="font-mono">ARCHIVE</span>
            {archiveCount > 0 && (
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 rounded-xs">
                {archiveCount}
              </span>
            )}
          </button>
        </nav>

      </div>
    </header>
  );
};


