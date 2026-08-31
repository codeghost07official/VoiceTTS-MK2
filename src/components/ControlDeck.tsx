import React from 'react';
import { Play, Pause, Square, Download, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import { PlaybackStatus } from '../types';
import { AudioOscilloscope } from './AudioOscilloscope';

interface ControlDeckProps {
  status: PlaybackStatus;
  progress: number; // 0 to 1
  currentTime: number;
  duration: number;
  onPrelisten: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDownload: () => void;
  onSeek?: (fraction: number) => void;
  hasText: boolean;
  errorMessage?: string | null;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  status,
  progress,
  currentTime,
  duration,
  onPrelisten,
  onPause,
  onResume,
  onStop,
  onDownload,
  onSeek,
  hasText,
  errorMessage,
}) => {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isGenerating = status === 'generating';

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(fraction);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#060913]/90 backdrop-blur-xl border border-white/15 p-4 sm:p-6 mt-6 shadow-xl shadow-black/40 rounded-xs">
      {/* Top Status & Live Oscilloscope */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
        {/* Left Status Tag */}
        <div className="md:col-span-4 flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              status === 'playing'
                ? 'bg-[#00F5FF] animate-ping'
                : status === 'generating'
                ? 'bg-[#C5A059] animate-pulse'
                : status === 'error'
                ? 'bg-rose-500'
                : 'bg-[#00F5FF]'
            }`}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono text-slate-300 tracking-[0.2em] uppercase font-semibold">
              STATUS PIPELINE
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-white truncate">
              {status === 'generating'
                ? 'GENERATING AUDIO...'
                : status === 'playing'
                ? 'PLAYING SPEECH'
                : status === 'paused'
                ? 'PAUSED'
                : status === 'error'
                ? 'SYNTHESIS ERROR'
                : 'READY FOR SYNTHESIS'}
            </span>
          </div>
        </div>

        {/* Middle/Right: Live Visualizer */}
        <div className="md:col-span-8">
          <AudioOscilloscope isPlaying={isPlaying} />
        </div>
      </div>

      {/* Error message banner if any */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-rose-200 text-xs font-mono rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress & Duration Track */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mb-1.5 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#00F5FF] font-bold">
            {duration > 0 ? formatTime(duration) : '--:--'}
          </span>
        </div>
        <div
          onClick={handleProgressBarClick}
          className="relative h-2 bg-white/15 cursor-pointer overflow-hidden border border-white/10 hover:border-[#00F5FF]/60 transition-colors rounded-xs"
        >
          <div
            className="h-full bg-[#00F5FF] transition-all duration-100 shadow-[0_0_10px_#00F5FF]"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Playback Controls Left */}
        <div className="sm:col-span-7 flex gap-2 sm:gap-3">
          {/* Primary PRELISTEN / PLAY / PAUSE Button */}
          {!isPlaying && !isPaused ? (
            <button
              id="prelisten-btn"
              type="button"
              disabled={!hasText || isGenerating}
              onClick={onPrelisten}
              className="flex-grow min-h-[48px] bg-[#00F5FF] text-[#020305] font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 hover:bg-[#38f8ff] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono shadow-[0_0_15px_rgba(0,245,255,0.3)] rounded-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#020305]" />
                  <span>SYNTHESIZING...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#020305] text-[#020305]" />
                  <span>PRELISTEN</span>
                </>
              )}
            </button>
          ) : isPlaying ? (
            <button
              id="pause-btn"
              type="button"
              onClick={onPause}
              className="flex-grow min-h-[48px] bg-[#00F5FF]/20 border border-[#00F5FF] text-[#00F5FF] font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 hover:bg-[#00F5FF]/30 transition-colors font-mono rounded-xs"
            >
              <Pause className="w-4 h-4 fill-[#00F5FF] text-[#00F5FF]" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              id="resume-btn"
              type="button"
              onClick={onResume}
              className="flex-grow min-h-[48px] bg-[#00F5FF] text-[#020305] font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 hover:bg-[#38f8ff] transition-colors font-mono rounded-xs"
            >
              <Play className="w-4 h-4 fill-[#020305] text-[#020305]" />
              <span>RESUME</span>
            </button>
          )}

          {/* STOP Button */}
          {(isPlaying || isPaused) && (
            <button
              id="stop-btn"
              type="button"
              onClick={onStop}
              className="min-h-[48px] px-4 bg-white/10 border border-white/20 text-white font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors font-mono rounded-xs"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">STOP</span>
            </button>
          )}
        </div>

        {/* Download Button Right */}
        <div className="sm:col-span-5 flex">
          <button
            id="download-audio-btn"
            type="button"
            disabled={!hasText || isGenerating}
            onClick={onDownload}
            className="w-full min-h-[48px] bg-white/5 border border-white/25 text-white font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 hover:bg-[#00F5FF]/15 hover:border-[#00F5FF]/60 hover:text-[#00F5FF] active:scale-[0.99] transition-all disabled:opacity-30 disabled:cursor-not-allowed font-mono shadow-md shadow-black/30 rounded-xs"
            title="Download true 16-bit 44.1kHz WAV audio file"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>EXPORT AUDIO</span>
          </button>
        </div>
      </div>
    </div>
  );
};


