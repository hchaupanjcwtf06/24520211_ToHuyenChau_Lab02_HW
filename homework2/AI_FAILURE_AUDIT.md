# HW2 AI Failure Mode Audit

This report distinguishes **risk code patterns** from verified historical AI errors. Do not claim invented failures actually occurred. Add real reproduction screenshots and Git diffs if obtained.

## Risk 01 — Async race / out-of-order queue
- Unsafe idea: start `fetch()` for every enqueue in parallel and update the active track in whichever promise resolves first.
- Safeguard: `isProcessing` and a single active task. The queue awaits load/decode/playback before dequeuing the next job.
- Automated proof: `tests/queue.test.ts` verifies A→B→C order and max concurrency 1.
- Manual proof to collect: rapidly add A, B, C and capture active/pending order.

## Risk 02 — Cancellation that leaves a zombie audio source
- Unsafe idea: abort the fetch but keep a started AudioBufferSourceNode alive.
- Safeguard: `AbortSignal` stops the source, unregisters abort handler, clears `onended`, disconnects node; `dispose()` also closes the audio context.
- Automated proof: queue cancellation tests pass; full browser Web Audio resource cleanup still requires a real DevTools check.
- Manual proof to collect: play a track, use Skip current and Cancel all, inspect audio stops promptly.

## Risk 03 — 60fps React state thrashing / RAF leak
- Unsafe idea: call `setState()` every animation frame and forget to cancel frame requests.
- Safeguard: Canvas draw uses a typed byte array and `requestAnimationFrame` directly, with `cancelAnimationFrame` in cleanup.
- Static evidence: `src/Visualizer.tsx` contains the draw/cancel path and no frame-level state update.
- Manual proof to collect: record Performance timeline and verify animation stops after page/component unmount.

## Evidence status
- Automated queue tests: **5/5 PASS** when run with Node.js 22.16.0 in the packaging environment (FIFO, cancel pending, cancel active, failure continuation, dispose). Re-run locally and preserve evidence.
- Browser playback / FFT / cancellation / cleanup: NOT YET VERIFIED on student's device.
- Git history of real AI-detected bugs: NONE CLAIMED.
