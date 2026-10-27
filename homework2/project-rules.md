# HW2 Engineering Rules

1. Follow the slide 31 contract: Web Audio API, AnalyserNode FFT 256/512, FIFO serialized download/decode, AbortController cancellation, explicit AudioBufferSourceNode cleanup, requestAnimationFrame visualizer.
2. Keep network/decode/playback in `audio-engine.ts`, queue state and scheduling in `audio-task-queue.ts`, visual draw in `Visualizer.tsx`, UI in `App.tsx`.
3. Never mutate React state within a `requestAnimationFrame` render loop.
4. Keep all listeners and object URLs cleaned up on component unmount.
5. Never generate a one-shot commit as evidence of staged design: review and run each test/commit step separately.
6. Do not import code from `homework1` and do not touch `homework3`.
7. Use `const`/`let`, no implicit globals, no unsafe `innerHTML`, no inline HTML event handler.
