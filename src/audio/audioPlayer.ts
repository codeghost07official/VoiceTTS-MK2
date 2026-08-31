/**
 * Audio Player & Real-time Spectral Analyser
 * Coordinates Web Audio playback, AnalyserNode frequency data, and speech synthesis state.
 */

export class AudioEnginePlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private synthInterval: number | null = null;

  // Analyser data arrays
  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;

  public initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.frequencyData) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return new Uint8Array(128);
  }

  public getTimeDomainData(): Uint8Array {
    if (this.analyser && this.timeDomainData) {
      this.analyser.getByteTimeDomainData(this.timeDomainData);
      return this.timeDomainData;
    }
    return new Uint8Array(256).fill(128);
  }

  public playBlob(
    blob: Blob,
    speed: number = 1.0,
    onProgress?: (currentTime: number, duration: number) => void,
    onEnded?: () => void
  ): { pause: () => void; resume: () => void; stop: () => void; seek: (time: number) => void } {
    this.initContext();
    this.stop();

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = speed;
    this.currentAudioElement = audio;

    if (this.audioCtx && this.analyser) {
      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (e) {
        // Source node might already be connected if element reused
      }
    }

    audio.ontimeupdate = () => {
      if (onProgress && !isNaN(audio.duration)) {
        onProgress(audio.currentTime, audio.duration);
      }
    };

    audio.onended = () => {
      if (onEnded) onEnded();
      URL.revokeObjectURL(url);
    };

    audio.play().catch(console.error);

    return {
      pause: () => audio.pause(),
      resume: () => audio.play(),
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(url);
      },
      seek: (time: number) => {
        audio.currentTime = time;
      }
    };
  }

  public playSpeechUtterance(
    text: string,
    voice: SpeechSynthesisVoice | null,
    speed: number,
    pitch: number,
    onProgress?: (progressPercent: number) => void,
    onEnded?: () => void
  ): { pause: () => void; resume: () => void; stop: () => void } {
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = speed;
    utterance.pitch = pitch;

    const estimatedDuration = (text.length / 15) * (1 / speed) * 1000;
    const startTime = Date.now();

    this.synthInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(0.98, elapsed / estimatedDuration);
      if (onProgress) onProgress(progress);
    }, 100);

    utterance.onend = () => {
      if (this.synthInterval) clearInterval(this.synthInterval);
      if (onProgress) onProgress(1.0);
      if (onEnded) onEnded();
    };

    utterance.onerror = (e) => {
      if (this.synthInterval) clearInterval(this.synthInterval);
      if (onEnded) onEnded();
      console.warn('SpeechSynthesis error:', e);
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    return {
      pause: () => window.speechSynthesis.pause(),
      resume: () => window.speechSynthesis.resume(),
      stop: () => {
        if (this.synthInterval) clearInterval(this.synthInterval);
        window.speechSynthesis.cancel();
      }
    };
  }

  public stop() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
  }
}

export const globalAudioPlayer = new AudioEnginePlayer();
