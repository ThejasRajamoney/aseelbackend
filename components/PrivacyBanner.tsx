'use client';

import { Lock } from 'lucide-react';

export function PrivacyBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/95 p-4 shadow-[0_0_40px_rgba(201,168,76,0.05)] sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
        <Lock className="h-4 w-4" />
      </div>
      <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
        Zero data storage. Student text is analyzed in real time and discarded immediately, and teacher views stay anonymized and aggregated.
      </p>
    </div>
  );
}
