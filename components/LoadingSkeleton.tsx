'use client';

interface LoadingSkeletonProps {
  message?: string;
}

export function LoadingSkeleton({ message = 'Reading your work...' }: LoadingSkeletonProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/95 p-5 shadow-[0_0_40px_rgba(201,168,76,0.05)]">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="h-[140px] w-[140px] animate-pulse rounded-full border border-[color:var(--border)] bg-[color:var(--bg-primary)]/70 sm:h-[180px] sm:w-[180px]" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-3 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-3/4 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
            {message}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4">
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
