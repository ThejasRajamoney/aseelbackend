'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, MessageSquareText, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AnalysisLanguage, AnalysisSection, AnswerReviewResult } from '@/lib/types';
import { ConcernBadge } from '@/components/ConcernBadge';

interface SectionCardProps {
  section: AnalysisSection;
  subject: string;
  language: AnalysisLanguage;
}

export function SectionCard({ section, subject, language }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<string[]>(() => section.questions.map(() => ''));
  const [reviews, setReviews] = useState<Array<AnswerReviewResult | null>>(() =>
    section.questions.map(() => null),
  );
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    setAnswers(section.questions.map(() => ''));
    setReviews(section.questions.map(() => null));
    setReviewingIndex(null);
  }, [section.id, section.questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  async function handleAnalyze(index: number) {
    const answer = answers[index].trim();
    if (!answer) {
      return;
    }

    const submittedAnswer = answer;
    setReviewingIndex(index);

    try {
      const response = await fetch('/api/review-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: section.questions[index],
          answer,
          excerpt: section.excerpt,
          subject,
          language,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Review failed');
      }

      if (typeof data?.summary !== 'string' || typeof data?.improvement !== 'string') {
        throw new Error('Unexpected review response');
      }

      if (typeof data?.isPerfect !== 'boolean') {
        throw new Error('Unexpected review response');
      }

      if (answersRef.current[index].trim() !== submittedAnswer) {
        return;
      }

      setReviews((current) => {
        const next = [...current];
        next[index] = data;
        return next;
      });
    } catch {
      if (answersRef.current[index].trim() !== submittedAnswer) {
        return;
      }

      setReviews((current) => {
        const next = [...current];
        next[index] = {
          summary: 'Aseel could not review this answer right now.',
          improvement: 'Try again in a moment, or add more detail to your answer.',
          isPerfect: false,
        };
        return next;
      });
    } finally {
      setReviewingIndex((current) => (current === index ? null : current));
    }
  }

  const completedAnswers = answers.filter((answer) => answer.trim().length > 0).length;
  const allReviewedPerfect =
    completedAnswers > 0 &&
    completedAnswers === section.questions.length &&
    reviews.every((review) => review?.isPerfect);

  const sectionNote =
    allReviewedPerfect
      ? 'Aseel says: perfect. Nothing more to improve here.'
      : completedAnswers === 0
      ? 'Aseel says: answer these in your own words. One specific example will make this much stronger.'
      : completedAnswers < section.questions.length
        ? 'Aseel says: keep going. Add a concrete example or explanation to every answer.'
        : 'Aseel says: nice work. The next step is to make each answer more specific and evidence-based.';

  return (
    <motion.div layout className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/95 p-4 shadow-[0_0_40px_rgba(201,168,76,0.06)]">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <code className="block max-w-full break-words rounded-lg bg-[color:var(--bg-primary)]/70 px-3 py-1 font-mono text-xs text-[color:var(--text-secondary)]">
                {section.excerpt}
              </code>
              <ConcernBadge level={section.concern} />
            </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--accent-gold)]">
          {expanded ? 'Hide Questions' : 'See Questions'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      <p className="mt-3 text-sm italic leading-6 text-[color:var(--text-secondary)]">{section.reason}</p>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-[color:var(--border)] pt-4">
              {section.questions.map((question, index) => (
                <div
                  key={`${section.id}-${index}`}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/25 bg-[color:var(--accent-gold)]/10 text-xs font-semibold text-[color:var(--accent-gold)]">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 text-sm font-medium leading-6 text-[color:var(--text-primary)]">
                        <MessageSquareText className="h-4 w-4 text-[color:var(--accent-gold)]" />
                        <span className="min-w-0 break-words">{question}</span>
                      </div>
                        <textarea
                          value={answers[index]}
                          onChange={(event) => {
                          const nextValue = event.target.value;
                          setAnswers((current) => {
                            const nextAnswers = [...current];
                            nextAnswers[index] = nextValue;
                            return nextAnswers;
                          });
                          setReviews((current) => {
                            const nextReviews = [...current];
                            nextReviews[index] = null;
                            return nextReviews;
                          });
                          setReviewingIndex((current) => (current === index ? null : current));
                          }}
                          placeholder="Type your answer in your own words..."
                          className="aseel-input mt-3 min-h-[96px] resize-y sm:min-h-[108px]"
                        />
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnalyze(index)}
                          disabled={!answers[index].trim()}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-gold)] px-4 py-3 text-sm font-semibold text-[color:var(--bg-primary)] transition hover:bg-[color:var(--accent-gold-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {reviewingIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          {reviewingIndex === index ? 'Analyzing...' : 'Submit & Analyze'}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                        This sends your answer to Aseel and returns live feedback, or a perfect result when no changes are needed.
                      </p>

                      <div className="mt-3 rounded-xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/8 px-4 py-3 text-xs leading-5 text-[color:var(--text-secondary)]">
                        {reviewingIndex === index ? (
                          <div className="flex items-center gap-2 text-[color:var(--accent-gold)]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Aseel is reviewing your answer...
                          </div>
                        ) : reviews[index]?.isPerfect ? (
                          <div className="space-y-2 text-[color:var(--success)]">
                            <div className="flex items-center gap-2 font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              Perfect.
                            </div>
                            <div className="text-[color:var(--text-secondary)]">{reviews[index]?.summary}</div>
                          </div>
                        ) : reviews[index] ? (
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold text-[color:var(--accent-gold)]">Aseel noticed: </span>
                              {reviews[index]?.summary}
                            </div>
                            <div>
                              <span className="font-semibold text-[color:var(--accent-gold)]">Improve it by: </span>
                              {reviews[index]?.improvement}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-[color:var(--accent-gold)]">Aseel:</span> Click Submit & Analyze to get feedback.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Aseel&apos;s note</div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">{sectionNote}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
