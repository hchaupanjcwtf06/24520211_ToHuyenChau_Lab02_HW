import { abortError } from './audio-task-queue';

export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private disposed = false;

  async start(): Promise<void> {
    if (this.disposed) throw new Error('Audio engine was disposed');
    if (!this.context) {
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.78;
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.65;
      this.analyser.connect(this.gain);
      this.gain.connect(this.context.destination);
    }
    await this.context.resume();
  }

  getAnalyser(): AnalyserNode | null { return this.analyser; }
  getSampleRate(): number { return this.context?.sampleRate ?? 44100; }

  setFftSize(size: 256 | 512): void {
    if (this.analyser) this.analyser.fftSize = size;
  }

  async loadAndPlay(url: string, signal: AbortSignal): Promise<AudioBuffer> {
    if (signal.aborted) throw abortError();
    await this.start();
    if (signal.aborted) throw abortError();
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Audio download failed (HTTP ${response.status})`);
    const bytes = await response.arrayBuffer();
    if (signal.aborted) throw abortError();
    const buffer = await this.context!.decodeAudioData(bytes);
    // decodeAudioData cannot be aborted; check the token immediately afterward.
    if (signal.aborted) throw abortError();
    await this.play(buffer, signal);
    return buffer;
  }

  private play(buffer: AudioBuffer, signal: AbortSignal): Promise<void> {
    if (!this.context || !this.analyser || signal.aborted) return Promise.reject(abortError());
    const context = this.context;
    const analyser = this.analyser;
    return new Promise<void>((resolve, reject) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      this.activeSource = source;
      let settled = false;
      const cleanup = () => {
        source.onended = null;
        signal.removeEventListener('abort', onAbort);
        source.disconnect();
        if (this.activeSource === source) this.activeSource = null;
      };
      const finish = (reason?: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (reason) reject(reason); else resolve();
      };
      const onAbort = () => {
        try { source.stop(); } catch { /* source may already have ended */ }
        finish(abortError());
      };
      source.onended = () => finish(signal.aborted ? abortError() : undefined);
      signal.addEventListener('abort', onAbort, { once: true });
      if (signal.aborted) { onAbort(); return; }
      try { source.start(); } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    try { this.activeSource?.stop(); } catch { /* already finished */ }
    this.activeSource?.disconnect();
    this.activeSource = null;
    this.analyser?.disconnect();
    this.gain?.disconnect();
    if (this.context) await this.context.close();
    this.context = null;
    this.analyser = null;
    this.gain = null;
  }
}
