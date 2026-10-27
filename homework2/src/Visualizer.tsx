import { useEffect, useRef } from 'react';

type Props = { analyser: AnalyserNode | null; running: boolean };

export function Visualizer({ analyser, running }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!analyser || !running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const values = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      // Draw directly to Canvas, not React state: avoids 60 re-renders per second.
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      analyser.getByteFrequencyData(values);
      ctx.clearRect(0, 0, width, height);
      const count = Math.min(values.length, 64);
      const gap = 3 * ratio;
      const barWidth = (width - (count - 1) * gap) / count;
      for (let i = 0; i < count; i++) {
        const index = Math.floor(i * values.length / count);
        const value = values[index] / 255;
        const barHeight = Math.max(2 * ratio, value * height * 0.92);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#9bb6ff');
        gradient.addColorStop(1, '#48e6c0');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, Math.max(1, barWidth), barHeight);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, running]);
  return <canvas ref={canvasRef} className="visualizer" role="img" aria-label="Live audio frequency visualizer" />;
}
