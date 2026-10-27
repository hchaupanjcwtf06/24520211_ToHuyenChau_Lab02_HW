export interface Clock { now(): number }
export const systemClock: Clock = { now: () => Date.now() };
export function remainingUntil(deadlineMs: number, nowMs: number): number {
  return Math.max(0, deadlineMs - nowMs);
}
export function createAntiDriftTimer(
  durationMs: number,
  onTick: (remainingMs: number) => void,
  options: { clock?: Clock; raf?: typeof requestAnimationFrame; cancelRaf?: typeof cancelAnimationFrame } = {},
): () => void {
  if (!Number.isFinite(durationMs) || durationMs < 0) throw new RangeError('Invalid duration');
  const clock = options.clock ?? systemClock;
  const schedule = options.raf ?? requestAnimationFrame;
  const cancel = options.cancelRaf ?? cancelAnimationFrame;
  const deadline = clock.now() + durationMs;
  let frame: number | undefined;
  let stopped = false;
  function tick() {
    if (stopped) return;
    const remaining = remainingUntil(deadline, clock.now());
    onTick(remaining);
    if (remaining > 0) frame = schedule(tick);
  }
  // Initial state is immediate; each subsequent update uses the original deadline.
  tick();
  return () => { stopped = true; if (frame !== undefined) cancel(frame); };
}
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
