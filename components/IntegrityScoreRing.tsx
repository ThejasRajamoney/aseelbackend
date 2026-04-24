'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IntegrityScoreRingProps {
  score: number;
}

export function IntegrityScoreRing({ score }: IntegrityScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const clampedScore = Math.max(0, Math.min(100, score));
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const accentColor =
    clampedScore >= 80
      ? 'var(--success)'
      : clampedScore >= 50
        ? 'var(--warning)'
        : 'var(--danger)';

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1100;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayScore(Math.round(clampedScore * progress));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [clampedScore]);

  return (
    <div className="relative flex h-[150px] w-[150px] items-center justify-center sm:h-[180px] sm:w-[180px]">
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl leading-none text-[color:var(--text-primary)] sm:text-5xl">
          {displayScore}
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)] sm:text-[10px]">
          / 100
        </span>
      </div>
    </div>
  );
}
