import { useEffect, useState } from 'react';
import { createAntiDriftTimer, formatRemaining } from '../core/anti-drift-timer';
export function Countdown({ deadline, onEnd }: { deadline: number; onEnd?: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
  useEffect(() => {
    // Deadline, not number of elapsed intervals, determines each update.
    const stop = createAntiDriftTimer(Math.max(0, deadline - Date.now()), setRemaining);
    return stop;
  }, [deadline]);
  useEffect(() => { if (remaining === 0) onEnd?.(); }, [remaining, onEnd]);
  return <output className="countdown" aria-label="Sale time remaining" aria-live="off">{formatRemaining(remaining)}<span className="milliseconds">.{String(Math.ceil(remaining % 1000 / 10)).padStart(2,'0')}</span></output>;
}
