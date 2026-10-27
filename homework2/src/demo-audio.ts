/** Generate deterministic PCM WAV files locally to make the demo fully offline. */
export type DemoTrack = { id: string; name: string; frequency: number; duration: number; accent: string };
export const DEMO_TRACKS: DemoTrack[] = [
  { id: 'pulse', name: 'Pulse / A4', frequency: 440, duration: 3, accent: '#7c9cff' },
  { id: 'echo', name: 'Echo / C5', frequency: 523.25, duration: 4, accent: '#58dfbb' },
  { id: 'glow', name: 'Glow / E5', frequency: 659.25, duration: 3.5, accent: '#ffbe75' },
  { id: 'bass', name: 'Bass / C3', frequency: 130.81, duration: 4, accent: '#c297ff' }
];

export function createWavBlob(frequency: number, durationSeconds: number): Blob {
  const sampleRate = 22050;
  const count = Math.floor(sampleRate * durationSeconds);
  const bytes = new ArrayBuffer(44 + count * 2);
  const view = new DataView(bytes);
  const put = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  put(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true);
  put(8, 'WAVE'); put(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  put(36, 'data'); view.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const time = i / sampleRate;
    const attack = Math.min(1, time / 0.05);
    const release = Math.min(1, (durationSeconds - time) / 0.18);
    const envelope = Math.max(0, Math.min(attack, release));
    const amplitude = Math.sin(2 * Math.PI * frequency * time)
      + 0.25 * Math.sin(2 * Math.PI * frequency * 2 * time);
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, amplitude * envelope * 18000)), true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}
