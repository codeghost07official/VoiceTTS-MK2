import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Initialize Express app
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Curated voices with friendly aliases and descriptors
const CURATED_VOICES = [
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Deep Natural)',
    shortName: 'en-US-ChristopherNeural',
    gender: 'male',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Clear / Resonant',
    category: 'neural',
    description: 'Deep, clear, and confident American male voice. Excellent for narration.',
    pitch: 1.0,
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Warm Articulate)',
    shortName: 'en-US-JennyNeural',
    gender: 'female',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Natural',
    category: 'neural',
    description: 'Natural, articulate, and friendly American female voice.',
    pitch: 1.0,
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Conversational Male)',
    shortName: 'en-US-GuyNeural',
    gender: 'male',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Warm',
    category: 'neural',
    description: 'Warm, conversational American male voice with natural cadence.',
    pitch: 1.0,
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (Dynamic Expressive)',
    shortName: 'en-US-AriaNeural',
    gender: 'female',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Expressive',
    category: 'neural',
    description: 'Expressive and engaging American female voice with rich dynamic range.',
    pitch: 1.0,
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan (British Articulate)',
    shortName: 'en-GB-RyanNeural',
    gender: 'male',
    locale: 'en-GB',
    langLabel: 'English (UK)',
    accent: 'UK Standard',
    category: 'neural',
    description: 'Clear, authoritative British male voice with refined pronunciation.',
    pitch: 1.0,
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia (British Melodic)',
    shortName: 'en-GB-SoniaNeural',
    gender: 'female',
    locale: 'en-GB',
    langLabel: 'English (UK)',
    accent: 'UK Melodic',
    category: 'neural',
    description: 'Sophisticated, pleasant British female voice with smooth cadence.',
    pitch: 1.0,
  },
  {
    id: 'en-AU-WilliamMultilingualNeural',
    name: 'William (Australian Warm)',
    shortName: 'en-AU-WilliamMultilingualNeural',
    gender: 'male',
    locale: 'en-AU',
    langLabel: 'English (AU)',
    accent: 'AU Natural',
    category: 'neural',
    description: 'Warm Australian male voice with natural inflection and clear articulation.',
    pitch: 1.0,
  },
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha (Australian Crisp)',
    shortName: 'en-AU-NatashaNeural',
    gender: 'female',
    locale: 'en-AU',
    langLabel: 'English (AU)',
    accent: 'AU Crisp',
    category: 'neural',
    description: 'Bright and articulate Australian female voice with crisp timbre.',
    pitch: 1.0,
  },
  {
    id: 'en-IN-PrabhatNeural',
    name: 'Prabhat (Indian English Male)',
    shortName: 'en-IN-PrabhatNeural',
    gender: 'male',
    locale: 'en-IN',
    langLabel: 'English (IN)',
    accent: 'Indian English',
    category: 'neural',
    description: 'Clear and natural Indian English male voice.',
    pitch: 1.0,
  },
  {
    id: 'en-IN-NeerjaNeural',
    name: 'Neerja (Indian English Female)',
    shortName: 'en-IN-NeerjaNeural',
    gender: 'female',
    locale: 'en-IN',
    langLabel: 'English (IN)',
    accent: 'Indian English',
    category: 'neural',
    description: 'Gentle and articulate Indian English female voice.',
    pitch: 1.0,
  },
  {
    id: 'en-US-EricNeural',
    name: 'Eric (Command Timbre)',
    shortName: 'en-US-EricNeural',
    gender: 'male',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Resonant',
    category: 'neural',
    description: 'Resonant and authoritative male voice.',
    pitch: 1.0,
  },
  {
    id: 'en-US-AvaNeural',
    name: 'Ava (Modern Natural)',
    shortName: 'en-US-AvaNeural',
    gender: 'female',
    locale: 'en-US',
    langLabel: 'English (US)',
    accent: 'US Modern',
    category: 'neural',
    description: 'Ultra-modern neural American female voice.',
    pitch: 1.0,
  }
];

// Helper: Normalize text before speech synthesis
function normalizeTextForTTS(rawText: string): string {
  if (!rawText) return '';
  let text = rawText
    .replace(/[\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Normalize quotes and dashes
  text = text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, ', ');

  return text;
}

// Split long text into sentence chunks to prevent timeouts
function chunkText(text: string, maxChunkLen: number = 300): string[] {
  const normalized = normalizeTextForTTS(text);
  if (normalized.length <= maxChunkLen) {
    return [normalized];
  }

  // Split on sentence boundaries
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxChunkLen) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmed.length <= maxChunkLen) {
        currentChunk = trimmed;
      } else {
        // Break long sentence by commas or clauses if necessary
        const parts = trimmed.split(/([,;:]\s+)/);
        let subChunk = '';
        for (const part of parts) {
          if (subChunk.length + part.length <= maxChunkLen) {
            subChunk += part;
          } else {
            if (subChunk) chunks.push(subChunk.trim());
            subChunk = part;
          }
        }
        currentChunk = subChunk.trim();
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.filter(c => c.length > 0);
}

// Synthesize a single chunk of text
async function synthesizeChunk(
  text: string,
  voiceId: string,
  speed: number = 1.0
): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  // Map 1.0x - 2.0x to rate string (e.g. "+0%", "+25%", "+50%", "+100%")
  const ratePercent = Math.round((speed - 1.0) * 100);
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

  const { audioStream } = tts.toStream(text, {
    rate: rateStr,
    pitch: '+0Hz',
    volume: '+0%',
  });

  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('TTS synthesis stream timed out'));
    }, 15000);

    audioStream.on('data', (data: Buffer) => {
      chunks.push(data);
    });

    audioStream.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });

    audioStream.on('error', (err: any) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'msedge-neural-tts', timestamp: new Date().toISOString() });
});

// Voices List API
app.get('/api/tts/voices', async (req, res) => {
  try {
    const tts = new MsEdgeTTS();
    const allVoices = await tts.getVoices();
    
    // Merge curated voices on top
    const curatedIds = new Set(CURATED_VOICES.map(v => v.id));
    const otherVoices = allVoices
      .filter(v => !curatedIds.has(v.ShortName) && v.Locale.startsWith('en-'))
      .map(v => ({
        id: v.ShortName,
        name: v.FriendlyName || v.Name.replace(/Microsoft Server Speech Text to Speech Voice \([^,]+,\s*([^)]+)\)/, '$1'),
        shortName: v.ShortName,
        gender: (v.Gender || 'synthetic').toLowerCase(),
        locale: v.Locale,
        langLabel: v.Locale,
        accent: v.Locale,
        category: 'neural',
        description: `Neural voice (${v.Locale})`,
        pitch: 1.0,
      }));

    res.json({
      success: true,
      voices: [...CURATED_VOICES, ...otherVoices],
    });
  } catch (error: any) {
    console.warn('Could not fetch dynamic voice list, returning curated list:', error?.message);
    res.json({
      success: true,
      voices: CURATED_VOICES,
    });
  }
});

// Text-to-Speech Synthesize API
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voiceId, speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Valid non-empty text is required.' });
    }

    const selectedVoiceId = voiceId || 'en-US-ChristopherNeural';
    const cleanSpeed = Math.max(0.5, Math.min(2.5, Number(speed) || 1.0));

    const chunks = chunkText(text, 350);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'Text resulted in zero valid tokens.' });
    }

    console.log(`[TTS] Synthesizing ${chunks.length} chunk(s) with voice '${selectedVoiceId}' at ${cleanSpeed}x...`);

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const chunkBuffer = await synthesizeChunk(chunk, selectedVoiceId, cleanSpeed);
      if (chunkBuffer.length > 0) {
        audioBuffers.push(chunkBuffer);
      }
    }

    const finalBuffer = Buffer.concat(audioBuffers);

    if (finalBuffer.length === 0) {
      throw new Error('Synthesis yielded empty audio stream.');
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': finalBuffer.length,
      'Cache-Control': 'no-cache',
      'X-TTS-Engine': 'Neural-PCM-44k',
      'X-TTS-Voice': selectedVoiceId,
      'X-TTS-Speed': cleanSpeed.toString(),
    });

    return res.send(finalBuffer);
  } catch (error: any) {
    console.error('[TTS Error]', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize speech audio.',
    });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VOX SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
