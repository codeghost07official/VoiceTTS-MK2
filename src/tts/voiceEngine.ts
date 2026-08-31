import { VoiceOption, AudioClip, VoiceGender } from '../types';
import { audioBufferToWav } from '../audio/wavEncoder';

// Curated Primary Neural Voices
export const CURATED_VOICES: VoiceOption[] = [
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Deep Natural)',
    gender: 'male',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Clear / Resonant',
    category: 'neural',
    description: 'Deep, clear, and confident American male voice. Exceptional narrative clarity.',
    pitch: 1.0,
    timbre: 'deep',
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Warm Articulate)',
    gender: 'female',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Natural',
    category: 'neural',
    description: 'Natural, articulate, and friendly American female voice.',
    pitch: 1.0,
    timbre: 'warm',
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Conversational Male)',
    gender: 'male',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Warm',
    category: 'neural',
    description: 'Warm, conversational American male voice with natural cadence.',
    pitch: 1.0,
    timbre: 'warm',
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (Dynamic Expressive)',
    gender: 'female',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Expressive',
    category: 'neural',
    description: 'Expressive and engaging American female voice with rich dynamic range.',
    pitch: 1.0,
    timbre: 'crisp',
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan (British Articulate)',
    gender: 'male',
    lang: 'en-GB',
    langLabel: 'English (UK)',
    accent: 'UK Standard',
    category: 'neural',
    description: 'Clear, authoritative British male voice with refined pronunciation.',
    pitch: 1.0,
    timbre: 'crisp',
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia (British Melodic)',
    gender: 'female',
    lang: 'en-GB',
    langLabel: 'English (UK)',
    accent: 'UK Melodic',
    category: 'neural',
    description: 'Sophisticated, pleasant British female voice with smooth cadence.',
    pitch: 1.0,
    timbre: 'warm',
  },
  {
    id: 'en-AU-WilliamMultilingualNeural',
    name: 'William (Australian Warm)',
    gender: 'male',
    lang: 'en-AU',
    langLabel: 'English (AU)',
    accent: 'AU Natural',
    category: 'neural',
    description: 'Warm Australian male voice with natural inflection.',
    pitch: 1.0,
    timbre: 'warm',
  },
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha (Australian Crisp)',
    gender: 'female',
    lang: 'en-AU',
    langLabel: 'English (AU)',
    accent: 'AU Crisp',
    category: 'neural',
    description: 'Bright and articulate Australian female voice with crisp timbre.',
    pitch: 1.0,
    timbre: 'crisp',
  },
  {
    id: 'en-IN-PrabhatNeural',
    name: 'Prabhat (Indian English Male)',
    gender: 'male',
    lang: 'en-IN',
    langLabel: 'English (IN)',
    accent: 'Indian English',
    category: 'neural',
    description: 'Clear and natural Indian English male voice.',
    pitch: 1.0,
    timbre: 'resonant',
  },
  {
    id: 'en-IN-NeerjaNeural',
    name: 'Neerja (Indian English Female)',
    gender: 'female',
    lang: 'en-IN',
    langLabel: 'English (IN)',
    accent: 'Indian English',
    category: 'neural',
    description: 'Gentle and articulate Indian English female voice.',
    pitch: 1.0,
    timbre: 'warm',
  },
  {
    id: 'en-US-EricNeural',
    name: 'Eric (Command Timbre)',
    gender: 'male',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Resonant',
    category: 'neural',
    description: 'Resonant and authoritative male voice.',
    pitch: 1.0,
    timbre: 'deep',
  },
  {
    id: 'en-US-AvaNeural',
    name: 'Ava (Modern Natural)',
    gender: 'female',
    lang: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Modern',
    category: 'neural',
    description: 'Ultra-modern neural American female voice.',
    pitch: 1.0,
    timbre: 'crisp',
  }
];

export const PRESET_VOICES = CURATED_VOICES;

/**
 * Helper to classify system voice gender from its name/lang
 */
function detectGender(voiceName: string): VoiceGender {
  const lower = voiceName.toLowerCase();
  if (
    lower.includes('female') ||
    lower.includes('zira') ||
    lower.includes('samantha') ||
    lower.includes('victoria') ||
    lower.includes('karen') ||
    lower.includes('moira') ||
    lower.includes('fiona') ||
    lower.includes('tessa') ||
    lower.includes('susan') ||
    lower.includes('catherine') ||
    lower.includes('alice') ||
    lower.includes('helena') ||
    lower.includes('laura') ||
    lower.includes('eva') ||
    lower.includes('yuri') ||
    lower.includes('kyoko') ||
    lower.includes('anna') ||
    lower.includes('hazel')
  ) {
    return 'female';
  }
  if (
    lower.includes('male') ||
    lower.includes('david') ||
    lower.includes('mark') ||
    lower.includes('george') ||
    lower.includes('daniel') ||
    lower.includes('alex') ||
    lower.includes('fred') ||
    lower.includes('oliver') ||
    lower.includes('tom') ||
    lower.includes('paul') ||
    lower.includes('arthur') ||
    lower.includes('stefan') ||
    lower.includes('diego') ||
    lower.includes('jorge')
  ) {
    return 'male';
  }
  return 'synthetic';
}

/**
 * Discover native browser SpeechSynthesis voices as secondary fallback
 */
export async function getSystemVoices(): Promise<VoiceOption[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      const onVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices();
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(voices);
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      setTimeout(() => {
        resolve(window.speechSynthesis.getVoices());
      }, 500);
    });
  };

  const rawVoices = await loadVoices();
  const systemOptions: VoiceOption[] = [];

  for (const v of rawVoices) {
    const gender = detectGender(v.name);
    systemOptions.push({
      id: `sys-${v.name.replace(/\s+/g, '-').toLowerCase()}-${v.lang}`,
      name: v.name.replace(/Microsoft|Google|Apple|Desktop|Natural/g, '').trim() || v.name,
      gender,
      lang: v.lang,
      langLabel: v.lang,
      accent: v.lang,
      category: 'system',
      description: `Browser SpeechSynthesis fallback voice (${v.lang})`,
      pitch: gender === 'female' ? 1.1 : 0.9,
      nativeVoice: v,
    });
  }

  return systemOptions;
}

/**
 * Fetch all available neural voices from the server API
 */
export async function fetchNeuralVoices(): Promise<VoiceOption[]> {
  try {
    const response = await fetch('/api/tts/voices');
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }
    const data = await response.json();
    if (data.voices && Array.isArray(data.voices)) {
      return data.voices.map((v: any) => ({
        id: v.id,
        name: v.name,
        gender: v.gender || 'male',
        lang: v.locale || 'en-US',
        langLabel: v.langLabel || v.locale || 'English',
        accent: v.accent || 'Neural',
        category: 'neural' as const,
        description: v.description || 'Neural High-Fidelity Voice',
        pitch: v.pitch || 1.0,
      }));
    }
  } catch (error) {
    console.warn('[TTS] Failed to fetch dynamic neural voices, using curated list:', error);
  }
  return CURATED_VOICES;
}

/**
 * Primary Real Text-to-Speech Engine
 * Generates genuine human-understandable speech audio by querying the neural TTS pipeline,
 * decoding into an AudioBuffer, and encoding a true 16-bit 44.1kHz/24kHz WAV binary Blob.
 */
export async function renderAcousticSpeechWav(
  text: string,
  voice: VoiceOption,
  speed: number = 1.0,
  onProgressState?: (msg: string) => void
): Promise<{ blob: Blob; duration: number; buffer: AudioBuffer; isFallback?: boolean }> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Text input cannot be empty.');
  }

  if (onProgressState) {
    onProgressState('Connecting to Neural Synthesis Pipeline...');
  }

  try {
    // 1. Request speech synthesis from server backend
    const response = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanText,
        voiceId: voice.id.startsWith('sys-') ? 'en-US-ChristopherNeural' : voice.id,
        speed: speed,
        pitch: voice.pitch || 1.0,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server synthesis error (${response.status})`);
    }

    if (onProgressState) {
      onProgressState('Decoding Neural Acoustic Stream...');
    }

    // 2. Read binary audio data
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Received empty audio payload from synthesis pipeline.');
    }

    // 3. Decode audio data into AudioBuffer for real-time oscilloscope analysis & playback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const tempAudioCtx = new AudioContextClass();
    const decodedBuffer = await tempAudioCtx.decodeAudioData(arrayBuffer);
    
    // 4. Encode AudioBuffer into a genuine 16-bit PCM WAV Blob with full RIFF/WAVE header
    const wavBlob = audioBufferToWav(decodedBuffer);

    return {
      blob: wavBlob,
      duration: decodedBuffer.duration,
      buffer: decodedBuffer,
      isFallback: false,
    };
  } catch (primaryError: any) {
    console.error('[Primary TTS Error]', primaryError);
    throw primaryError;
  }
}

/**
 * Storage helpers for generated audio history
 */
const HISTORY_KEY = 'vox_07_audio_archive';

export function getAudioArchive(): AudioClip[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => ({
      ...item,
      blobUrl: '',
    }));
  } catch (e) {
    return [];
  }
}

export function saveAudioToArchive(clip: Omit<AudioClip, 'blobUrl'>): void {
  try {
    const list = getAudioArchive();
    const cleanList = [clip, ...list.filter((c) => c.id !== clip.id)].slice(0, 15);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(cleanList));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

export function clearAudioArchive(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    // ignore
  }
}
