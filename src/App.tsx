/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CosmicUniverse } from './graphics/CosmicUniverse';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { TextWorkspace } from './components/TextWorkspace';
import { VoiceSelector } from './components/VoiceSelector';
import { SpeedSlider } from './components/SpeedSlider';
import { ControlDeck } from './components/ControlDeck';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { EngineInfoModal } from './components/EngineInfoModal';
import { VoiceOption, PlaybackStatus, AudioClip, DevicePreviewMode } from './types';
import {
  PRESET_VOICES,
  fetchNeuralVoices,
  getSystemVoices,
  renderAcousticSpeechWav,
  getAudioArchive,
  saveAudioToArchive,
  clearAudioArchive,
} from './tts/voiceEngine';
import { globalAudioPlayer } from './audio/audioPlayer';

const DEFAULT_TEXT =
  'Observatory Log MK2. We are receiving coherent acoustic resonance across the deep cosmic void. Frequency carrier verified at forty-four point one kilohertz. Systems fully nominal.';

const LAST_TEXT_KEY = 'voicetts_mk2_last_text';
const LAST_VOICE_KEY = 'voicetts_mk2_last_voice';
const LAST_SPEED_KEY = 'voicetts_mk2_last_speed';

export default function App() {
  // Device Mode State: 'auto' | 'pc' | 'tab' | 'phone'
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>('auto');

  // Text, Voice & Speed State
  const [text, setText] = useState<string>(() => {
    return (
      localStorage.getItem(LAST_TEXT_KEY) ||
      localStorage.getItem('vox_07_last_text') ||
      DEFAULT_TEXT
    );
  });
  const [voices, setVoices] = useState<VoiceOption[]>(PRESET_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    return (
      localStorage.getItem(LAST_VOICE_KEY) ||
      localStorage.getItem('vox_07_last_voice') ||
      PRESET_VOICES[0].id
    );
  });
  const [speed, setSpeed] = useState<number>(() => {
    const saved =
      localStorage.getItem(LAST_SPEED_KEY) ||
      localStorage.getItem('vox_07_last_speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Archive & Modals
  const [archive, setArchive] = useState<AudioClip[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  // Active audio playback controller
  const activePlaybackRef = useRef<{
    pause: () => void;
    resume: () => void;
    stop: () => void;
    seek?: (t: number) => void;
  } | null>(null);

  // Cached generated blob for current text + voice + speed
  const cachedAudioRef = useRef<{
    key: string;
    blob: Blob;
    duration: number;
  } | null>(null);

  // Initialize Voices & Archive on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAllVoices() {
      const [neuralVoices, sysVoices] = await Promise.all([
        fetchNeuralVoices(),
        getSystemVoices(),
      ]);

      if (!isMounted) return;

      const combined: VoiceOption[] = [...neuralVoices];
      const neuralIdSet = new Set(neuralVoices.map((v) => v.id));

      for (const sv of sysVoices) {
        if (!neuralIdSet.has(sv.id)) {
          combined.push(sv);
        }
      }

      setVoices(combined);
    }

    loadAllVoices();
    setArchive(getAudioArchive());

    // GSAP Entrance animation
    gsap.from('#main-content-container', {
      opacity: 0,
      y: 16,
      duration: 0.7,
      ease: 'power2.out',
    });

    return () => {
      isMounted = false;
      globalAudioPlayer.stop();
    };
  }, []);

  // Save text / speed / voice preferences to localStorage
  useEffect(() => {
    localStorage.setItem(LAST_TEXT_KEY, text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem(LAST_SPEED_KEY, speed.toString());
  }, [speed]);

  const handleSelectVoice = (v: VoiceOption) => {
    setSelectedVoiceId(v.id);
    localStorage.setItem(LAST_VOICE_KEY, v.id);
    cachedAudioRef.current = null;
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    cachedAudioRef.current = null;
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    cachedAudioRef.current = null;
    if (errorMessage) setErrorMessage(null);
  };

  const handleClearText = () => {
    handleStop();
    setText('');
    cachedAudioRef.current = null;
  };

  const currentVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  // Synthesis Helper: generate or retrieve cached AudioBuffer & WAV blob
  const generateAudioData = async (): Promise<{ blob: Blob; duration: number }> => {
    const cacheKey = `${text.trim()}_${currentVoice.id}_${speed}`;
    if (cachedAudioRef.current && cachedAudioRef.current.key === cacheKey) {
      return cachedAudioRef.current;
    }

    const result = await renderAcousticSpeechWav(text, currentVoice, speed);
    cachedAudioRef.current = {
      key: cacheKey,
      blob: result.blob,
      duration: result.duration,
    };

    // Save to archive
    const newClip: Omit<AudioClip, 'blobUrl'> = {
      id: `clip_${Date.now()}`,
      text: text.slice(0, 120),
      voiceId: currentVoice.id,
      voiceName: currentVoice.name,
      voiceGender: currentVoice.gender,
      speed,
      duration: result.duration,
      blob: result.blob,
      createdAt: Date.now(),
      fileSize: result.blob.size,
    };
    saveAudioToArchive(newClip);
    setArchive(getAudioArchive());

    return result;
  };

  // PRELISTEN / PLAY action
  const handlePrelisten = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter transmission text before prelistening.');
      return;
    }

    setErrorMessage(null);
    setStatus('generating');

    try {
      // 1. Synthesize WAV audio buffer via Neural TTS engine
      const { blob, duration: audioDur } = await generateAudioData();
      setStatus('playing');
      setDuration(audioDur);

      const ctrl = globalAudioPlayer.playBlob(
        blob,
        1.0, // playback rate already scaled in synthesized buffer
        (currTime, totalDur) => {
          setCurrentTime(currTime);
          setProgress(currTime / (totalDur || audioDur));
        },
        () => {
          setStatus('idle');
          setProgress(0);
          setCurrentTime(0);
        }
      );
      activePlaybackRef.current = ctrl;
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      
      // Fallback: If neural server synthesis fails, attempt native browser speech synthesis
      if (currentVoice.nativeVoice && 'speechSynthesis' in window) {
        console.warn('Falling back to browser SpeechSynthesis...');
        globalAudioPlayer.initContext();
        setStatus('playing');
        
        const estDuration = Math.max(1, (text.length / 14) * (1 / speed));
        setDuration(estDuration);

        const ctrl = globalAudioPlayer.playSpeechUtterance(
          text,
          currentVoice.nativeVoice,
          speed,
          currentVoice.pitch,
          (progressPercent) => {
            setProgress(progressPercent);
            setCurrentTime(progressPercent * estDuration);
          },
          () => {
            setStatus('idle');
            setProgress(0);
            setCurrentTime(0);
          }
        );
        activePlaybackRef.current = ctrl;
        setErrorMessage('Note: Using browser SpeechSynthesis fallback.');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to synthesize speech audio.');
      }
    }
  };

  const handlePause = () => {
    if (activePlaybackRef.current) {
      activePlaybackRef.current.pause();
      setStatus('paused');
    }
  };

  const handleResume = () => {
    if (activePlaybackRef.current) {
      activePlaybackRef.current.resume();
      setStatus('playing');
    }
  };

  const handleStop = () => {
    if (activePlaybackRef.current) {
      activePlaybackRef.current.stop();
      activePlaybackRef.current = null;
    }
    globalAudioPlayer.stop();
    setStatus('idle');
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (fraction: number) => {
    if (activePlaybackRef.current?.seek && duration > 0) {
      const targetTime = fraction * duration;
      activePlaybackRef.current.seek(targetTime);
      setCurrentTime(targetTime);
      setProgress(fraction);
    }
  };

  // DOWNLOAD AUDIO action
  const handleDownload = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter transmission text before downloading.');
      return;
    }

    setErrorMessage(null);
    const prevStatus = status;
    setStatus('generating');

    try {
      const { blob } = await generateAudioData();
      
      // Create download trigger
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      
      const safeVoiceName = currentVoice.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const dateStr = new Date().toISOString().slice(0, 10);
      anchor.download = `VOICE_TTS_MK2_${safeVoiceName}_${speed.toFixed(2)}x_${dateStr}.wav`;
      
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus(prevStatus === 'playing' ? 'playing' : 'idle');
    } catch (err: any) {
      console.error('Download error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to export WAV audio.');
    }
  };

  // Play clip from archive
  const handlePlayArchiveClip = (clip: AudioClip) => {
    setIsArchiveOpen(false);
    setText(clip.text);
    setSelectedVoiceId(clip.voiceId);
    setSpeed(clip.speed);
    
    // Trigger prelisten
    setTimeout(() => {
      handlePrelisten();
    }, 100);
  };

  // Download clip directly from archive
  const handleDownloadArchiveClip = (clip: AudioClip) => {
    renderAcousticSpeechWav(clip.text, currentVoice, clip.speed).then(({ blob }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const safeName = clip.voiceName.replace(/[^a-zA-Z0-9]/g, '_');
      anchor.download = `VOICE_TTS_MK2_${safeName}_${clip.id}.wav`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  };

  const handleClearArchive = () => {
    clearAudioArchive();
    setArchive([]);
  };

  // Dynamic layout class depending on device mode
  const getContainerWidthClass = () => {
    switch (deviceMode) {
      case 'phone':
        return 'max-w-md border-x border-white/15 bg-[#03060d]/60 px-3 sm:px-4';
      case 'tab':
        return 'max-w-2xl border-x border-white/10 bg-[#03060d]/40 px-4 sm:px-6';
      case 'pc':
        return 'max-w-5xl px-4 sm:px-6 lg:px-8';
      case 'auto':
      default:
        return 'max-w-5xl px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020305] text-white flex flex-col justify-between cosmic-grid selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
      
      {/* 3D Cosmic Particle System with Three.js & GLSL */}
      <CosmicUniverse isPlaying={status === 'playing'} />

      {/* Top Navbar */}
      <Navbar
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenVoices={() => {
          const el = document.getElementById('voice-dropdown-trigger');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        archiveCount={archive.length}
        deviceMode={deviceMode}
        onChangeDeviceMode={(mode) => setDeviceMode(mode)}
      />

      {/* Main Interactive Studio Container */}
      <main
        id="main-content-container"
        className={`relative z-10 flex-1 w-full mx-auto py-6 sm:py-8 transition-all duration-300 ${getContainerWidthClass()}`}
      >
        
        {/* Hero Section */}
        <HeroHeader />

        {/* Central Workspace (Textarea + Counters + Presets) */}
        <TextWorkspace
          text={text}
          onChangeText={handleTextChange}
          onClearText={handleClearText}
          disabled={status === 'generating'}
        />

        {/* Controls Matrix: Voice Selection + Speed Slider */}
        <div
          className={`grid gap-4 sm:gap-6 max-w-4xl mx-auto mt-4 sm:mt-6 ${
            deviceMode === 'phone' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {/* Voice Selector */}
          <VoiceSelector
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            onSelectVoice={handleSelectVoice}
            disabled={status === 'generating'}
          />

          {/* Speed Slider */}
          <SpeedSlider
            speed={speed}
            onChangeSpeed={handleSpeedChange}
            disabled={status === 'generating'}
          />
        </div>

        {/* Control Deck (Prelisten, Oscilloscope, Progress, Download WAV) */}
        <ControlDeck
          status={status}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onPrelisten={handlePrelisten}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onDownload={handleDownload}
          onSeek={handleSeek}
          hasText={!!text.trim()}
          errorMessage={errorMessage}
        />

      </main>

      {/* Subtle Futuristic Footer */}
      <footer className="relative z-10 border-t border-white/15 bg-[#03050a]/95 backdrop-blur-md py-4 text-center text-xs font-mono text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-pulse"></span>
            <span className="text-white font-medium">VOICE TTS MK2 &bull; NEURAL ACOUSTIC PCM WORKSTATION</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-300">
            <span className="text-[#00F5FF] font-semibold">100% FREE</span>
            <span>&bull;</span>
            <span>STUDIO QUALITY WAV EXPORT</span>
            <span>&bull;</span>
            <span>44.1 KHZ PCM</span>
          </div>
        </div>
      </footer>

      {/* Archive Drawer */}
      <ArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        clips={archive}
        onPlayClip={handlePlayArchiveClip}
        onDownloadClip={handleDownloadArchiveClip}
        onClearArchive={handleClearArchive}
      />

      {/* Engine Specs Modal */}
      <EngineInfoModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

    </div>
  );
}

