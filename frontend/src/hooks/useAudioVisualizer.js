import { useState, useEffect, useRef } from 'react';

export function useAudioVisualizer(mode = 'idle', barCount = 32) {
  const [frequencies, setFrequencies] = useState(() => new Array(barCount).fill(10));
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let phase = 0;

    const animate = () => {
      phase += 0.08;
      const newFreqs = [];

      for (let i = 0; i < barCount; i++) {
        let val = 10;
        if (mode === 'listening') {
          // Dynamic active wave
          const base = Math.sin(phase * 2 + i * 0.3) * 35 + Math.cos(phase * 1.5 - i * 0.2) * 25;
          val = Math.max(12, Math.min(95, Math.abs(base) + 20 + Math.random() * 15));
        } else if (mode === 'speaking') {
          // Smooth pulsating voice equalizer
          const base = Math.sin(phase * 3 + i * 0.4) * 45 + Math.sin(phase * 0.8) * 30;
          val = Math.max(15, Math.min(100, Math.abs(base) + 25));
        } else if (mode === 'processing') {
          // Scanning ripple
          const ripple = Math.sin(phase * 4 - i * 0.5);
          val = Math.max(8, Math.min(80, (ripple > 0.3 ? 65 : 15) + Math.random() * 10));
        } else {
          // Idle gentle breathing wave
          const base = Math.sin(phase + i * 0.2) * 12 + 18;
          val = Math.max(6, Math.min(35, base));
        }
        newFreqs.push(Math.round(val));
      }

      setFrequencies(newFreqs);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, barCount]);

  return frequencies;
}
