export type VoiceGender = 'male' | 'female' | 'synthetic';

export type DevicePreviewMode = 'auto' | 'pc' | 'tab' | 'phone';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  lang: string;
  langLabel: string;
  accent?: string;
  category: 'neural' | 'system' | 'cosmic';
  description: string;
  pitch: number; // 0.5 to 1.5
  timbre?: 'deep' | 'crisp' | 'warm' | 'robotic' | 'harmonic' | 'resonant';
  nativeVoice?: SpeechSynthesisVoice;
}

export type PlaybackStatus = 'idle' | 'generating' | 'playing' | 'paused' | 'completed' | 'error';

export interface AudioClip {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  voiceGender: VoiceGender;
  speed: number;
  duration: number; // seconds
  blobUrl: string;
  blob: Blob;
  createdAt: number;
  fileSize: number; // bytes
}

export interface ParticleSettings {
  count: number;
  speed: number;
  size: number;
  bloom: boolean;
  colorTheme: 'cyan-gold' | 'aurora' | 'deep-void';
}
