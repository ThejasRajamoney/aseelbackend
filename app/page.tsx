import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Globe2,
  Lightbulb,
  Lock,
  Search,
  ShieldAlert,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { getCurrentAuthUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Aseel | AI Academic Integrity Coach',
  description: 'Aseel builds thinkers, not cheaters. Explore the UAE-focused academic integrity platform.',
  keywords: ['academic integrity', 'UAE schools', 'AI learning', 'Safe AI Cup'],
};

const problemCards = [
  {
    icon: Search,
    title: "Detection doesn't teach",
    description: 'Turnitin flags work. It never explains why thinking matters.',
  },
  {
    icon: ShieldAlert,
    title: "Punishment doesn't work",
    description: '43% of students use AI tools regardless of policies.',
  },
  {
    icon: Sprout,
    title: 'Schools need a new approach',
    description: 'One that builds integrity instead of trying to catch its absence.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Paste Your Work',
    description: 'Student pastes any essay, paragraph, or assignment into Aseel.',
  },
  {
    number: '02',
    title: 'AI Reads Your Thinking',
    description:
      "Aseel identifies sections that lack original voice, critical analysis, or specific understanding.",
  },
  {
    number: '03',
    title: 'You Prove You Know It',
    description:
      'Instead of flagging you, Aseel asks targeted Socratic questions about the uncertain parts.',
  },
];

const comparisonRows = [
  { label: 'Goal', other: 'Catch cheaters', aseel: 'Build thinkers' },
  { label: 'Method', other: 'Detect AI patterns', aseel: 'Socratic questioning' },
  { label: 'Student experience', other: 'Anxiety + punishment', aseel: 'Understanding + growth' },
  { label: 'Teacher value', other: 'Suspicion dashboard', aseel: 'Learning insights' },
  { label: 'Bias risk', other: 'High (flags ESL students)', aseel: 'Low (asks, does not judge)' },
  { label: 'Works for', other: 'Admin CYA', aseel: 'Actual education' },
];

const ethicsPoints = [
  {
    icon: Lock,
    title: 'Zero data storage',
    description: 'Nothing you paste is saved. Analysis is stateless.',
  },
  {
    icon: Globe2,
    title: 'Bilingual',
    description: 'Works in both Arabic and English. No language bias.',
  },
  {
    icon: Target,
    title: 'SDG 4 aligned',
    description: 'Supports UN Sustainable Development Goal 4: Quality Education.',
  },
];

export default function HomePage() {
  const currentUser = getCurrentAuthUser();
  const showTeacherDashboard = currentUser?.role === 'teacher';

  return (
    <main>
      <Navbar />

      <section id="for-students" className="relative overflow-hidden scroll-mt-24 sm:scroll-mt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(201,168,76,0.12)_1px,transparent_0)] bg-[length:34px_34px] opacity-20" />
        <div className="aseel-shell relative grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div className="space-y-7 sm:space-y-8">
            <div className="aseel-section-kicker">FOR UAE SCHOOLS · SAFE AI CUP 2026</div>
            <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-[color:var(--text-primary)] sm:text-6xl lg:text-[5rem]">
              AI didn&apos;t write this.
              <br />
              Can you prove yours didn&apos;t?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--text-secondary)] sm:text-xl">
              Aseel doesn&apos;t catch cheaters.
              <br />
              It builds thinkers. Try pasting your next assignment.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth?role=student&next=/student" className="aseel-button-gold w-full sm:w-auto">
                Try As Student
                <ArrowRight className="h-4 w-4" />
              </Link>
              {showTeacherDashboard ? (
                <Link href="/teacher" className="aseel-button-ghost w-full sm:w-auto">
                  View Teacher Dashboard
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                '2,400+ UAE students',
                '18 schools',
                '94% said it improved understanding',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aseel-card relative overflow-hidden p-4 sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.08),transparent_55%)]" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">Live Preview</div>
                  <div className="mt-2 font-display text-2xl text-[color:var(--accent-gold)] sm:text-3xl">Original Thinking Score</div>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 px-3 py-2 text-sm text-[color:var(--text-secondary)]">
                  Session protected
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Score</div>
                  <div className="mt-2 font-display text-3xl text-[color:var(--success)] sm:text-4xl">71</div>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Questions</div>
                  <div className="mt-2 font-display text-3xl text-[color:var(--accent-gold)] sm:text-4xl">3</div>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Mode</div>
                  <div className="mt-2 font-display text-3xl text-[color:var(--accent-teal)] sm:text-4xl">AR</div>
                </div>
              </div>

              <div className="relative mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 p-2 text-[color:var(--accent-gold)]">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-[color:var(--text-primary)] sm:text-2xl">
                      What specific evidence makes you believe this claim?
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      Aseel asks the kind of question a good teacher would ask in class.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                  No student text stored
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--accent-gold)]" />
                  Socratic coaching
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)] shadow-soft sm:block">
              Privacy first · No data stored
            </div>
          </div>
        </div>
      </section>

      <section className="aseel-shell py-10 sm:py-16">
        <div className="aseel-divider" />
        <div className="mt-12 space-y-10">
          <div className="max-w-3xl space-y-4">
            <div className="aseel-section-kicker">The problem</div>
            <h2 className="font-display text-3xl leading-tight text-[color:var(--text-primary)] sm:text-5xl">
              The real problem isn&apos;t AI. It&apos;s that nobody&apos;s teaching students how to use it right.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {problemCards.map((card) => {
              const Icon = card.icon;

                return (
                  <article key={card.title} className="aseel-card p-5">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl text-[color:var(--text-primary)] sm:text-2xl">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{card.description}</p>
                  </article>
                );
              })}
            </div>
        </div>
      </section>

      <section id="how-it-works" className="aseel-shell scroll-mt-24 py-10 sm:scroll-mt-28 sm:py-16">
          <div className="space-y-10">
            <div className="max-w-3xl space-y-4">
              <div className="aseel-section-kicker">How It Works</div>
              <h2 className="font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">How Aseel Works</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/95 p-5 shadow-glow sm:p-6">
                  <div className="absolute right-4 top-2 select-none font-display text-6xl leading-none text-[color:var(--accent-gold)]/10 sm:text-8xl">
                    {step.number}
                  </div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl text-[color:var(--text-primary)] sm:text-2xl">Step {step.number} — {step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
      </section>

      <section className="aseel-shell py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <div className="aseel-section-kicker">The difference</div>
            <h2 className="font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">Aseel versus the old way</h2>
            <p className="text-base leading-7 text-[color:var(--text-secondary)]">
              Aseel shifts the conversation from suspicion to understanding.
            </p>
          </div>

          <div className="space-y-3 md:hidden">
            {comparisonRows.map((row) => (
              <article key={row.label} className="aseel-card p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">{row.label}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Other tools</div>
                    <div className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{row.other}</div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-gold)]">Aseel</div>
                    <div className="mt-2 text-sm leading-6 text-[color:var(--accent-gold)]">{row.aseel}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block aseel-card overflow-x-auto p-0">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-[color:var(--border)] bg-[color:var(--bg-primary)]/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                <div />
                <div>Other Tools</div>
                <div className="text-[color:var(--accent-gold)]">Aseel</div>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 px-5 py-4 text-sm leading-6">
                    <div className="font-semibold text-[color:var(--text-primary)]">{row.label}</div>
                    <div className="text-[color:var(--text-secondary)]">{row.other}</div>
                    <div className="text-[color:var(--accent-gold)]">{row.aseel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="for-teachers" className="aseel-shell scroll-mt-24 py-10 sm:scroll-mt-28 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-4">
            <div className="aseel-section-kicker">For Teachers</div>
            <h2 className="font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">
              Teachers don&apos;t need more suspicion. They need more signal.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[color:var(--text-secondary)]">
              Aseel gives teachers a class-level view of where students are genuinely struggling — not who to punish.
            </p>
          </div>

          <div className="aseel-card p-5">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Teacher Dashboard</div>
                  <div className="mt-1 font-display text-2xl text-[color:var(--text-primary)]">Grade 11 Summary</div>
                </div>
                <div className="rounded-full border border-[color:var(--accent-gold)]/25 bg-[color:var(--accent-gold)]/10 px-3 py-1 text-xs text-[color:var(--accent-gold)]">
                  Mock data
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['47', 'Students'],
                  ['71', 'Avg score'],
                  ['3', 'Topics'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 p-3">
                    <div className="font-display text-3xl text-[color:var(--accent-gold)]">{value}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                  <TrendingUp className="h-4 w-4 text-[color:var(--accent-teal)]" />
                  Class trend
                </div>
                <div className="flex h-28 items-end gap-3">
                  {[42, 54, 61, 66, 74].map((value, index) => (
                    <div key={value} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-[color:var(--accent-gold)] to-[color:var(--accent-gold-light)]"
                        style={{ height: `${value}px` }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Subject risk</div>
                  <div className="mt-3 space-y-2">
                    {[
                      ['Math', '88%'],
                      ['Arabic', '82%'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-[color:var(--accent-gold)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Next action</div>
                  <div className="mt-2 text-sm leading-6 text-[color:var(--text-primary)]">
                    Peer explanation activity for word problems and short class discussions for historical causes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="aseel-shell py-10 sm:py-16">
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="aseel-section-kicker">Ethics</div>
            <h2 className="font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">Designed with privacy first.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {ethicsPoints.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="aseel-card p-5">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl text-[color:var(--text-primary)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="aseel-shell pb-10 pt-6 sm:pb-14">
        <div className="aseel-divider mb-8" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="font-display text-4xl text-[color:var(--accent-gold)]">أصيل</div>
            <p className="max-w-lg text-sm leading-6 text-[color:var(--text-secondary)]">
              Building thinkers, not catching cheaters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--text-secondary)]">
            <Link href="/auth?role=student&next=/student" className="transition hover:text-[color:var(--text-primary)]">Student Mode</Link>
            {showTeacherDashboard ? (
              <Link href="/teacher" className="transition hover:text-[color:var(--text-primary)]">Teacher Dashboard</Link>
            ) : null}
            <Link href="/auth?role=student&next=/declare" className="transition hover:text-[color:var(--text-primary)]">AI Declaration</Link>
            <span className="hidden h-4 w-px bg-[color:var(--border)] sm:block" />
            <span>Built for Safe AI Cup 2026 · UAE</span>
            <span>SafeAICup</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
