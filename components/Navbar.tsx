'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AuthSessionResponse, AuthUser } from '@/lib/types';

const homeLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Students', href: '#for-students' },
  { label: 'For Teachers', href: '#for-teachers' },
];

const appLinks = [
  { label: 'Home', href: '/' },
  { label: 'Student Mode', href: '/student' },
  { label: 'Teacher Dashboard', href: '/teacher' },
  { label: 'AI Declaration', href: '/declare' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const links = isHome ? homeLinks : appLinks;
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetch('/api/auth')
      .then((response) => response.json())
      .then((data: AuthSessionResponse) => {
        if (active) {
          setAuthUser(data.user ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setAuthUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setMobileOpen(false);
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthUser(null);
    router.push('/');
    router.refresh();
  }

  const signInHref = isHome
    ? '/auth?role=student&next=/student'
    : pathname === '/teacher'
      ? '/auth?role=teacher&next=/teacher'
      : '/auth?role=student&next=/student';

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--bg-primary)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)] shadow-[0_0_30px_rgba(201,168,76,0.14)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-2xl font-semibold text-[color:var(--accent-gold)]">أصيل</div>
            <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">Aseel</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active = isHome ? link.href === '#how-it-works' : pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={[
                  'rounded-full px-4 py-2 text-sm transition',
                  active
                    ? 'bg-[color:var(--accent-gold)]/12 text-[color:var(--accent-gold)]'
                    : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 px-3 py-2 text-xs text-[color:var(--text-secondary)] sm:block">
                {authUser.name}
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] px-4 py-2.5 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href={signInHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent-gold)] px-4 py-2.5 text-sm font-semibold text-[color:var(--bg-primary)] transition hover:bg-[color:var(--accent-gold-light)]"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-3 text-[color:var(--text-primary)] md:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-navigation" className="border-t border-[color:var(--border)] bg-[color:var(--bg-primary)]/95 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6">
            <nav className="grid gap-2">
              {links.map((link) => {
                const active = isHome ? link.href === '#how-it-works' : pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                      active
                        ? 'border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]'
                        : 'border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 text-[color:var(--text-secondary)]',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {authUser === undefined ? (
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                Checking session...
              </div>
            ) : authUser ? (
              <div className="grid gap-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                  Signed in as <span className="text-[color:var(--text-primary)]">{authUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href={signInHref}
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent-gold)] px-4 py-3 text-sm font-semibold text-[color:var(--bg-primary)] transition hover:bg-[color:var(--accent-gold-light)]"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
