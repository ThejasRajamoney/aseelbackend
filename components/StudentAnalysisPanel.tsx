'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Languages,
  Lightbulb,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IntegrityScoreRing } from '@/components/IntegrityScoreRing';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { PrivacyBanner } from '@/components/PrivacyBanner';
import { SectionCard } from '@/components/SectionCard';
import { demoEssay, loadingMessages, subjectOptions } from '@/lib/site-data';
import type { AnalysisLanguage, AnalysisResult, AuthUser } from '@/lib/types';

type Subject = (typeof subjectOptions)[number];

const defaultSubject: Subject = 'English';

interface StudentAnalysisPanelProps {
  currentUser?: AuthUser;
}

function getScoreCopy(score: number) {
  if (score >= 80) {
    return 'Strong original voice. Answer the questions below to confirm.';
  }

  if (score >= 50) {
    return 'Some sections need your own thinking. Let\'s explore them.';
  }

  return 'This work needs more of YOU in it. Start with these questions.';
}

export function StudentAnalysisPanel({ currentUser }: StudentAnalysisPanelProps) {
  const [studentId, setStudentId] = useState(currentUser?.id ?? '');
  const [studentName, setStudentName] = useState(currentUser?.name ?? '');
  const [text, setText] = useState('');
  const [subject, setSubject] = useState<Subject>(defaultSubject);
  const [language, setLanguage] = useState<AnalysisLanguage>('en');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setStudentId(currentUser.id);
      setStudentName(currentUser.name);
      return;
    }

    const storedId = window.localStorage.getItem('aseel-student-id');
    const nextId = storedId || crypto.randomUUID();

    if (!storedId) {
      window.localStorage.setItem('aseel-student-id', nextId);
    }

    setStudentId(nextId);

    const storedName = window.localStorage.getItem('aseel-student-name');
    if (storedName) {
      setStudentName(storedName);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      return;
    }

    if (studentName.trim()) {
      window.localStorage.setItem('aseel-student-name', studentName.trim());
    }
  }, [studentName, currentUser]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setLoadingMessageIndex(0);
    const interval = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  async function submitAnalysis(nextText = text, nextSubject = subject, nextLanguage = language) {
    const trimmed = nextText.trim();
    const resolvedStudentId = studentId || currentUser?.id || crypto.randomUUID();
    const resolvedStudentName = studentName.trim() || currentUser?.name || 'Anonymous Student';

    if (!studentId) {
      setStudentId(resolvedStudentId);
      window.localStorage.setItem('aseel-student-id', resolvedStudentId);
    }

    if (trimmed.length < 50) {
      setError('Please paste at least a paragraph of your work.');
      return;
    }

    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed.slice(0, 5000),
          subject: nextSubject,
          language: nextLanguage,
          studentId: resolvedStudentId,
          studentName: resolvedStudentName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || 'Analysis failed. Please try again.');
        return;
      }

      setResult(data as AnalysisResult);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemo() {
    setText(demoEssay);
    setSubject('History');
    setLanguage('en');
    void submitAnalysis(demoEssay, 'History', 'en');
  }

  function handleClear() {
    setText('');
    setResult(null);
    setError('');
  }

  const loadingMessage = loadingMessages[loadingMessageIndex];

  return (
    <main className="aseel-shell py-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="aseel-section-kicker">Student Mode</div>
          <h1 className="mt-3 font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">Paste Your Work</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">
            Aseel will ask you questions - not judge you.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className="aseel-button-ghost w-full sm:w-auto">
            Back Home
          </Link>
          <Link href="/declare" className="aseel-button-gold w-full sm:w-auto">
            AI Declaration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
        <section className="aseel-card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Paste your work</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              Paste any essay, paragraph, or assignment and Aseel will ask targeted Socratic questions.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
              Student name
            </label>
            <input
              className="aseel-input"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Your name or class label"
            />
            <p className="text-xs leading-5 text-[color:var(--text-muted)]">
              Used to group your submissions in the student database.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
              Subject
            </label>
            <select className="aseel-input" value={subject} onChange={(event) => setSubject(event.target.value as Subject)}>
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </span>
              </label>
              <span className="text-xs text-[color:var(--text-muted)]">Questions only, UI stays in English</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'English', value: 'en' as const },
                { label: 'عربي', value: 'ar' as const },
              ].map((option) => {
                const active = language === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={[
                      'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                      active
                        ? 'border-[color:var(--accent-gold)] bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]'
                        : 'border-[color:var(--border)] bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
              Your work
            </label>
            <div className="relative">
              <textarea
                className="aseel-input min-h-[240px] resize-y pr-16 sm:min-h-[300px]"
                placeholder="Paste your essay, paragraph, or any written assignment here..."
                value={text}
                maxLength={5000}
                onChange={(event) => {
                  setText(event.target.value);
                  if (error) {
                    setError('');
                  }
                }}
              />
              <div className="pointer-events-none absolute bottom-3 right-4 text-xs text-[color:var(--text-muted)]">
                {text.length}/5000
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!text.trim() || isLoading}
              onClick={() => void submitAnalysis()}
              className="aseel-button-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reading your thinking...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Analyze My Work
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>

            <button type="button" onClick={handleDemo} className="aseel-button-ghost w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Try Demo
            </button>

            <button type="button" onClick={handleClear} className="aseel-button-ghost w-full sm:w-auto">
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          <p className="text-sm text-[color:var(--text-secondary)]">
            <span className="font-semibold text-[color:var(--accent-gold)]">🔒</span> Your work is never stored. Analysis happens in real time and is immediately discarded.
          </p>
        </section>

        <section className="lg:sticky lg:top-28">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
              >
                <LoadingSkeleton message={loadingMessage} />
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="aseel-card space-y-6 p-5 sm:p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <IntegrityScoreRing score={result.integrityScore} />
                    <div className="space-y-3">
                      <div className="aseel-section-kicker">Original Thinking Score</div>
                      <h3 className="font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">{getScoreCopy(result.integrityScore)}</h3>
                      <p className="max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">{result.overallFeedback}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-5">
                  <div className="flex items-center gap-2 text-[color:var(--success)]">
                    <CheckCircle2 className="h-4 w-4" />
                    <h4 className="font-semibold">What&apos;s working</h4>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--text-primary)]">
                    {result.positives.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--success)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="aseel-section-kicker">Questions to prove this is yours</div>
                    <h4 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Sections to explore</h4>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      These are not accusations - they are your chance to show what you know.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {result.sections.map((section) => (
                      <SectionCard key={section.id} section={section} subject={subject} language={language} />
                    ))}
                  </div>
                </div>

                <div className="aseel-card p-5">
                  <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4">
                    <Lightbulb className="mt-0.5 h-5 w-5 text-[color:var(--accent-gold)]" />
                    <div>
                      <div className="font-semibold text-[color:var(--text-primary)]">Subject tip</div>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">{result.subjectTip}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4">
                    <h4 className="font-display text-xl text-[color:var(--text-primary)] sm:text-2xl">What to do next</h4>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                      {result.integrityScore >= 80
                        ? 'Great foundation. Answer the questions above and your work is solid.'
                        : 'Try answering each question in 2-3 sentences, then update those sections in your own words.'}
                    </p>
                    <div className="mt-5">
                      <Link href="/declare" className="aseel-button-gold w-full sm:w-auto">
                        Add an AI Use Declaration to your submission
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
                className="aseel-card flex min-h-[420px] items-center justify-center p-6 text-center sm:min-h-[680px]"
              >
                <div className="max-w-md space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                    <BookOpen className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Your analysis will appear here</h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                      Paste your work and click Analyze to begin.
                    </p>
                  </div>
                  <PrivacyBanner />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
