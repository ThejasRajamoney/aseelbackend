'use client';

import type { ConcernLevel } from '@/lib/types';

const badgeConfig: Record<ConcernLevel, { label: string; className: string }> = {
  high: {
    label: 'Look Deeper',
    className: 'border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 text-[color:var(--danger)]',
  },
  medium: {
    label: 'Explore',
    className: 'border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
  },
  low: {
    label: 'Minor',
    className: 'border-[color:var(--teal)]/40 bg-[color:var(--teal)]/10 text-[color:var(--teal)]',
  },
};

interface ConcernBadgeProps {
  level: ConcernLevel;
}

export function ConcernBadge({ level }: ConcernBadgeProps) {
  const config = badgeConfig[level];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${config.className}`}>
      {config.label}
    </span>
  );
}
