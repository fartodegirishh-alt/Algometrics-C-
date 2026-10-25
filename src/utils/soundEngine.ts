class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTone(frequency: number, type: 'compare' | 'swap' | 'sorted' | 'search_hit') {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'compare') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'swap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency * 1.25, now);
        osc.frequency.exponentialRampToValueAtTime(frequency, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'search_hit' || type === 'sorted') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * 1.5, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch {
      // AudioContext may be blocked or unsupported; silent fallback
    }
  }

  public playComparisonTone(valA: number, valB: number) {
    const avg = (valA + valB) / 2;
    // Map value (5 to 100) to pleasant musical frequency (260Hz to 780Hz)
    const freq = 260 + (avg / 100) * 520;
    this.playTone(freq, 'compare');
  }

  public playSwapTone(valA: number, valB: number) {
    const avg = (valA + valB) / 2;
    const freq = 300 + (avg / 100) * 450;
    this.playTone(freq, 'swap');
  }

  public playSuccessTone() {
    this.playTone(659.25, 'sorted'); // E5
  }
}

export const soundEngine = new SoundEngine();
