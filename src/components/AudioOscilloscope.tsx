import React, { useEffect, useRef } from 'react';
import { globalAudioPlayer } from '../audio/audioPlayer';

interface AudioOscilloscopeProps {
  isPlaying: boolean;
}

export const AudioOscilloscope: React.FC<AudioOscilloscopeProps> = ({ isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number | null>(null);

  // Resize canvas when container size changes
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width * (window.devicePixelRatio || 1);
          canvas.height = height * (window.devicePixelRatio || 1);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      phase += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle horizontal center line
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isPlaying) {
        const timeData = globalAudioPlayer.getTimeDomainData();
        const freqData = globalAudioPlayer.getFrequencyData();

        // 1. Draw Spectrum frequency bars
        const barCount = 42;
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const freqVal = freqData[i % freqData.length] || 0;
          const barHeight = (freqVal / 255) * (height * 0.8);
          const x = i * barWidth;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, 'rgba(0, 245, 255, 0.15)');
          grad.addColorStop(1, 'rgba(0, 245, 255, 0.7)');

          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
        }

        // 2. Draw live oscillogram time-domain line
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#00F5FF';
        ctx.shadowColor = '#00F5FF';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle ambient subtle sine carrier wave
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.45)';
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.04 + phase) * 5 * Math.sin(x * 0.015);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="w-full h-14 bg-[#03060d]/90 rounded-xs border border-[#00F5FF]/30 overflow-hidden relative shadow-inner"
    >
      <div className="absolute top-1 left-2 text-[9px] font-mono text-[#00F5FF] tracking-widest font-semibold pointer-events-none">
        SPECTRAL OSCILLOSCOPE // REALTIME
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

