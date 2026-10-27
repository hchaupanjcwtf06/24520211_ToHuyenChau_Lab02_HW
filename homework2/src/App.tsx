import { useEffect, useRef, useState } from 'react';
import { AudioTaskQueue, type QueueSnapshot } from './audio-task-queue';
import { AudioEngine } from './audio-engine';
import { Visualizer } from './Visualizer';
import { DEMO_TRACKS, createWavBlob, type DemoTrack } from './demo-audio';

type Track = DemoTrack & { url: string; isCustom?: boolean };
const emptySnapshot: QueueSnapshot = { active: null, pending: [], completed: 0, cancelled: 0 };

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [snapshot, setSnapshot] = useState<QueueSnapshot>(emptySnapshot);
  const [fftSize, setFftSize] = useState<256 | 512>(256);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Select tracks to enqueue. Audio starts after a user click.');
  const engineRef = useRef<AudioEngine | null>(null);
  const queueRef = useRef<AudioTaskQueue<AudioBuffer> | null>(null);
  const urlsRef = useRef<string[]>([]);
  const trackMapRef = useRef(new Map<string, string>());

  useEffect(() => {
    const engine = new AudioEngine();
    const queue = new AudioTaskQueue<AudioBuffer>((url, signal) => engine.loadAndPlay(url, signal));
    engineRef.current = engine;
    queueRef.current = queue;
    const off = queue.subscribe(setSnapshot);
    const generated = DEMO_TRACKS.map((track) => {
      const url = URL.createObjectURL(createWavBlob(track.frequency, track.duration));
      urlsRef.current.push(url);
      trackMapRef.current.set(url, track.name);
      return { ...track, url };
    });
    setTracks(generated);
    return () => {
      off();
      queue.dispose();
      void engine.dispose();
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
      engineRef.current = null;
      queueRef.current = null;
    };
  }, []);

  const nameOf = (url: string) => trackMapRef.current.get(url) ?? 'Unknown track';

  async function enqueue(track: Track): Promise<void> {
    const engine = engineRef.current;
    const queue = queueRef.current;
    if (!engine || !queue) return;
    // Unlock AudioContext while the user activation is still available.
    try {
      await engine.start();
      engine.setFftSize(fftSize);
      setReady(true);
      setMessage(`Queued: ${track.name}`);
      void queue.enqueue(track.url).then(
        () => setMessage(`Finished: ${track.name}`),
        (error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') setMessage(`Cancelled: ${track.name}`);
          else setMessage(`Playback error: ${error instanceof Error ? error.message : String(error)}`);
        }
      );
    } catch (error) {
      setMessage(`Cannot start audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function addFiles(files: FileList | null): void {
    if (!files) return;
    const next: Track[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('audio/')) continue;
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      trackMapRef.current.set(url, file.name);
      next.push({ id: `local-${crypto.randomUUID()}`, name: file.name, frequency: 0, duration: 0, accent: '#7c9cff', url, isCustom: true });
    }
    setTracks((current) => [...current, ...next]);
    setMessage(next.length ? `Added ${next.length} local file(s)` : 'No supported audio files selected');
  }

  function updateFft(size: 256 | 512): void {
    setFftSize(size);
    engineRef.current?.setFftSize(size);
  }

  return (
    <main className="app-shell">
      <header className="topbar"><span className="brand-mark">◉</span><span>ACOUSTIC / LAB</span><span className="topbar-tag">HOMEWORK 02</span></header>
      <section className="hero">
        <p className="eyebrow">WEB AUDIO API · FIFO CONCURRENCY · FFT</p>
        <h1>Sound, in the <em>right order.</em></h1>
        <p>Queue multiple tracks at once. Downloads, decoding and playback run one at a time, while the frequency display animates directly on Canvas.</p>
      </section>
      <section className="main-grid" aria-label="Audio queue workspace">
        <div className="left-stack">
          <section className="panel visual-panel" aria-labelledby="visual-heading">
            <div className="panel-top"><div><p className="eyebrow">LIVE SPECTRUM</p><h2 id="visual-heading">Frequency analyzer</h2></div><span className="live-dot">{snapshot.active ? '● ACTIVE' : '○ IDLE'}</span></div>
            <Visualizer analyser={engineRef.current?.getAnalyser() ?? null} running={ready} />
            <div className="fft-controls"><span>FFT SIZE</span><div className="segmented"><button type="button" className={fftSize === 256 ? 'current' : ''} aria-pressed={fftSize === 256} onClick={() => updateFft(256)}>256</button><button type="button" className={fftSize === 512 ? 'current' : ''} aria-pressed={fftSize === 512} onClick={() => updateFft(512)}>512</button></div><span>{fftSize / 2} frequency bins</span></div>
          </section>
          <section className="panel" aria-labelledby="library-heading"><div className="panel-top"><div><p className="eyebrow">01 / SOURCE</p><h2 id="library-heading">Track library</h2></div><span className="pill">{tracks.length} tracks</span></div>
            <div className="track-list">{tracks.map((track, index) => <div className="track" key={track.id}><span className="track-number">{String(index + 1).padStart(2, '0')}</span><span className="track-art" style={{ background: track.accent }} aria-hidden="true">♫</span><div className="track-text"><strong>{track.name}</strong><small>{track.isCustom ? 'LOCAL AUDIO FILE' : `${track.duration.toFixed(1)} SEC · GENERATED WAV`}</small></div><button type="button" className="enqueue" onClick={() => void enqueue(track)} aria-label={`Add ${track.name} to FIFO queue`}>+ Queue</button></div>)}</div>
            <label className="upload">Add local audio files <input type="file" accept="audio/*" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} /></label>
          </section>
        </div>
        <aside className="panel queue-panel" aria-labelledby="queue-heading"><div className="panel-top"><div><p className="eyebrow">02 / EXECUTION</p><h2 id="queue-heading">FIFO queue</h2></div><span className="pill">{snapshot.pending.length} waiting</span></div>
          <div className="now-playing"><p className="eyebrow">NOW PROCESSING</p><strong>{snapshot.active ? nameOf(snapshot.active) : 'Nothing playing'}</strong><small>{snapshot.active ? 'Loading · decoding · playing' : 'Choose a track to begin'}</small></div>
          <h3 className="subheading">UP NEXT</h3>
          <ol className="pending-list">{snapshot.pending.length ? snapshot.pending.map((url, index) => <li key={`${url}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{nameOf(url)}</strong></li>) : <li className="empty">Queue is empty</li>}</ol>
          <div className="stats"><div><strong>{snapshot.completed}</strong><span>Completed</span></div><div><strong>{snapshot.cancelled}</strong><span>Cancelled</span></div></div>
          <div className="queue-actions"><button type="button" className="secondary" disabled={!snapshot.active} onClick={() => queueRef.current?.cancelActive()}>Skip current</button><button type="button" className="secondary" disabled={!snapshot.pending.length} onClick={() => queueRef.current?.cancelPending()}>Clear waiting</button><button type="button" className="danger" disabled={!snapshot.active && !snapshot.pending.length} onClick={() => queueRef.current?.cancelAll()}>Cancel all</button></div>
          <p className="status" role="status" aria-live="polite">{message}</p>
        </aside>
      </section>
      <footer>LOCAL DEMO · NO API KEY REQUIRED · CLEANUP ON UNMOUNT</footer>
    </main>
  );
}
