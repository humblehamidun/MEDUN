// Web Audio API based notification chime & ambient synthesizer
class SoundChime {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a gentle two-tone chime for task reminders
  playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // Play celebration sound when task is completed
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // Synthesize smooth soothing brown/rain noise for Zen focus
  startAmbientFocusNoise(volume: number = 0.08) {
    if (this.isAmbientPlaying) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // 5-second buffer of filtered noise looped seamlessly
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise low-pass filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Additional subtle lowpass filter for gentle rain/deep warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      this.ambientSource = noiseSource;
      this.ambientGain = gain;
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  stopAmbientFocusNoise() {
    if (!this.isAmbientPlaying) return;
    try {
      const ctx = this.getContext();
      if (this.ambientGain && ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.ambientSource) {
            try {
              this.ambientSource.stop();
              this.ambientSource.disconnect();
            } catch {}
            this.ambientSource = null;
          }
          this.ambientGain = null;
          this.isAmbientPlaying = false;
        }, 850);
      } else {
        if (this.ambientSource) {
          try {
            this.ambientSource.stop();
          } catch {}
          this.ambientSource = null;
        }
        this.isAmbientPlaying = false;
      }
    } catch (e) {
      console.warn('Stop ambient error:', e);
      this.isAmbientPlaying = false;
    }
  }

  isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundChime = new SoundChime();
