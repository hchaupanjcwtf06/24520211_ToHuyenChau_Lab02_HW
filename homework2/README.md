# HW2 — Concurrent FIFO Audio Visualizer Queue Engine

Independent React + TypeScript + Vite homework inside the **same repository** as `homework1` and `homework3`.

## Source requirements (Lab 02 slide 31)

- Web Audio API + `AnalyserNode` FFT size **256 or 512** (resulting `frequencyBinCount` is 128 or 256).
- FIFO queue for concurrent user enqueue requests, processing load/decode/playback **serially**.
- `AbortController` cancels pending and active work; explicit `AudioBufferSourceNode` stop/disconnect and teardown.
- `requestAnimationFrame` Canvas visualization, no per-frame React re-render.

## Run (Windows CMD in repository root)

```cmd
cd homework2
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Open the localhost URL shown by Vite. You need a modern browser that supports the Web Audio API. Audio requires clicking `+ Queue` to unlock the browser audio context.

## Manual test checklist (capture screenshots)

1. Click `+ Queue` on A4, C5 and E5 quickly. Pending tracks remain FIFO; only one plays at a time.
2. Wait for all tasks: completed count increases to 3, active/pending empty.
3. Switch FFT 256 ↔ 512: bin count label becomes 128 ↔ 256.
4. Play a track and observe animated frequency spectrum.
5. While playing, click **Skip current**: source stops and next pending track begins.
6. Add 3 tracks, click **Clear waiting**: pending clears while current continues.
7. Add 3 tracks, click **Cancel all**: active stops and pending is cancelled.
8. Upload a short local audio file and enqueue it. Unsupported format should report a readable error without blocking subsequent tracks.
9. In DevTools, inspect Console (no uncaught errors), Memory/Performance (no RAF state thrashing), and confirm animation stops when leaving page.
10. Run `npm run build` and `npm test`; capture terminal output.

## Architecture

- `src/audio-task-queue.ts`: reusable FIFO, one active task, AbortController per task, dispose.
- `src/audio-engine.ts`: AudioContext, fetch, decode, AudioBufferSourceNode, AnalyserNode, cleanup.
- `src/Visualizer.tsx`: Canvas loop via requestAnimationFrame.
- `src/demo-audio.ts`: generates deterministic short WAV files locally with no network/API key.
- `src/App.tsx`: controls + progress, not the queue implementation.
- `tests/queue.test.ts`: deterministic FIFO/cancellation/error tests (Node.js >=22).

## Known constraints

- The provided tones are locally generated browser demo data, not streamed/downloaded third-party music; they still pass through `fetch(blob URL)` and `decodeAudioData`.
- Web Audio audio decoding cannot be aborted mid-call; cancellation is checked immediately afterward to discard stale results.
- Timing varies with browser scheduling, so **60fps is a target, not a guaranteed measured value** until a Performance recording is captured.
- Browser resource cleanup and actual memory consumption require manual DevTools measurements.
