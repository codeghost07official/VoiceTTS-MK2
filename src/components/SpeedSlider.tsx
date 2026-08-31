import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface SpeedSliderProps {
  speed: number;
  onChangeSpeed: (speed: number) => void;
  disabled?: boolean;
}

const SPEED_PRESETS = [1.0, 1.25, 1.5, 1.75, 2.0];

export const SpeedSlider: React.FC<SpeedSliderProps> = ({
  speed,
  onChangeSpeed,
  disabled = false,
}) => {
  const handleStep = (delta: number) => {
    const next = Math.round((speed + delta) * 100) / 100;
    const clamped = Math.max(1.0, Math.min(2.0, next));
    onChangeSpeed(clamped);
  };

  const percentage = ((speed - 1.0) / (2.0 - 1.0)) * 100;

  return (
    <div className="relative w-full flex flex-col gap-2">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-slate-300 uppercase tracking-[0.25em] font-mono font-semibold">
          Velocity / Speed
        </label>
        <span className="text-xs sm:text-sm font-mono text-[#00F5FF] font-bold bg-[#00F5FF]/10 px-2 py-0.5 border border-[#00F5FF]/40 rounded-xs">
          {speed.toFixed(2)}X
        </span>
      </div>

      {/* Futuristic Track & Slider matching Design */}
      <div className="relative h-12 flex items-center bg-[#070c18]/60 px-3 border border-white/15 rounded-xs">
        <div className="w-full h-[2px] bg-white/25 relative">
          <div
            className="absolute h-full bg-[#00F5FF] transition-all duration-75 shadow-[0_0_8px_#00F5FF]"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute h-4 w-1.5 bg-[#00F5FF] -top-2 shadow-[0_0_10px_#00F5FF] transition-all duration-75 pointer-events-none rounded-xs"
            style={{ left: `${percentage}%` }}
          />
          <div className="absolute flex justify-between w-full top-3 text-[9px] font-mono text-slate-300 font-medium pointer-events-none">
            <span>1.0x</span>
            <span>1.5x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Real Range Input layered on top */}
        <input
          id="tts-speed-slider"
          type="range"
          min="1.0"
          max="2.0"
          step="0.05"
          value={speed}
          disabled={disabled}
          aria-label="Audio Playback Speed"
          onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
      </div>

      {/* Fine-Tuning & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {SPEED_PRESETS.map((val) => {
            const isActive = Math.abs(speed - val) < 0.03;
            return (
              <button
                key={val}
                id={`speed-preset-${val}`}
                type="button"
                disabled={disabled}
                onClick={() => onChangeSpeed(val)}
                className={`px-2 py-1 transition-all rounded-xs text-[9px] ${
                  isActive
                    ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/60 font-bold shadow-[0_0_6px_rgba(0,245,255,0.2)]'
                    : 'text-slate-300 hover:text-white border border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                {val.toFixed(2)}x
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            id="speed-decrement-btn"
            disabled={disabled || speed <= 1.0}
            onClick={() => handleStep(-0.05)}
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center bg-white/10 hover:bg-[#00F5FF]/20 text-slate-200 hover:text-[#00F5FF] border border-white/20 hover:border-[#00F5FF]/50 transition-colors disabled:opacity-20 rounded-xs"
            title="Decrease 0.05x"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            id="speed-increment-btn"
            disabled={disabled || speed >= 2.0}
            onClick={() => handleStep(0.05)}
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center bg-white/10 hover:bg-[#00F5FF]/20 text-slate-200 hover:text-[#00F5FF] border border-white/20 hover:border-[#00F5FF]/50 transition-colors disabled:opacity-20 rounded-xs"
            title="Increase 0.05x"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};


