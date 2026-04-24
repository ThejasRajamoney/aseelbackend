'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  Users,
  UserPlus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { PrivacyBanner } from '@/components/PrivacyBanner';
import { buildStudentInviteLink } from '@/lib/invite';
import type { AuthUser, StudentInviteEmailResult, TeacherDashboardData, TeacherStudentRow } from '@/lib/types';
import {
  teacherResources,
  teacherSubjectBreakdown,
} from '@/lib/site-data';

type Tab = 'overview' | 'reports' | 'subjects' | 'students' | 'resources';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'reports', label: 'Class Reports' },
  { id: 'subjects', label: 'Subject Breakdown' },
  { id: 'students', label: 'Students' },
  { id: 'resources', label: 'Resources' },
];

const fallbackDashboardData: TeacherDashboardData = {
  overviewCards: [
    { label: 'Students Analyzed This Week', value: '0' },
    { label: 'Avg Integrity Score', value: '0/100', meta: 'No submissions yet' },
    { label: 'Topics Needing Review', value: '0' },
    { label: 'Most Improved', value: 'Waiting for first submission' },
  ],
  trend: [0, 0, 0, 0],
  trendLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  subjectBreakdown: teacherSubjectBreakdown.map((item) => ({ label: item.label, value: 0 })),
  topics: [],
  students: [],
  recentSubmissions: [],
};

function buildPolylinePoints(values: number[], width: number, height: number) {
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const padding = 28;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = height - padding - ((value - min) / Math.max(max - min, 1)) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

function OverviewSection({ dashboard }: { dashboard: TeacherDashboardData }) {
  const trend = dashboard.trend.length === 4 ? dashboard.trend : fallbackDashboardData.trend;
  const width = 640;
  const height = 240;
  const points = buildPolylinePoints(trend, width, height);
  const recentSubmissions = dashboard.recentSubmissions.slice(0, 5);
  const hasTrendData = recentSubmissions.length > 0;

  return (
    <section id="overview" className="space-y-5">
      <div>
        <div className="aseel-section-kicker">Overview</div>
        <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Class-level snapshot</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.overviewCards.map((card) => (
          <article key={card.label} className="aseel-card p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">{card.label}</div>
            <div className="mt-3 font-display text-3xl text-[color:var(--text-primary)] sm:text-4xl">{card.value}</div>
            {'meta' in card ? <div className="mt-2 text-sm text-[color:var(--accent-teal)]">{card.meta}</div> : null}
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="aseel-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
            <TrendingUp className="h-4 w-4 text-[color:var(--accent-teal)]" />
            Class Average Original Thinking Score - Last 4 Weeks
          </div>
          {hasTrendData ? (
            <>
              <svg className="h-[220px] w-full sm:h-[240px]" viewBox={`0 0 ${width} ${height}`}>
                <defs>
                  <linearGradient id="teacherLine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-gold-light)" />
                    <stop offset="100%" stopColor="var(--accent-gold)" />
                  </linearGradient>
                </defs>
                <line x1="28" x2={width - 28} y1={height - 28} y2={height - 28} stroke="rgba(255,255,255,0.08)" />
                <polyline
                  fill="none"
                  points={points}
                  stroke="url(#teacherLine)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {trend.map((value, index) => {
                  const min = Math.min(...trend) - 4;
                  const max = Math.max(...trend) + 4;
                  const x = 28 + (index / Math.max(trend.length - 1, 1)) * (width - 56);
                  const y = height - 28 - ((value - min) / Math.max(max - min, 1)) * (height - 56);

                  return (
                    <g key={value}>
                      <circle cx={x} cy={y} r="6" fill="var(--accent-gold)" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                      <text x={x} y={y - 14} textAnchor="middle" fill="var(--text-secondary)" fontSize="11">
                        {value}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                {dashboard.trendLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg-primary)]/30 px-6 py-5 text-center text-sm leading-7 text-[color:var(--text-secondary)]">
              No submissions yet. The class trend will appear here after students analyze their work.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="aseel-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
              <Users className="h-4 w-4 text-[color:var(--accent-gold)]" />
              Recent student submissions
            </div>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[color:var(--text-primary)]">{submission.studentName}</div>
                        <div className="text-xs text-[color:var(--text-secondary)]">{submission.subject}</div>
                      </div>
                      <div className="font-display text-2xl text-[color:var(--accent-gold)]">{submission.score}</div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--text-secondary)]">{submission.excerpt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[color:var(--text-secondary)]">
                No submissions yet. Analyze a student essay to populate the database.
              </p>
            )}
          </div>
          <PrivacyBanner />
        </div>
      </div>
    </section>
  );
}

function ReportsSection({ dashboard }: { dashboard: TeacherDashboardData }) {
  return (
    <section id="reports" className="space-y-5">
      <div>
        <div className="aseel-section-kicker">Class Reports</div>
        <h2 className="mt-2 flex items-center gap-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">
          <BarChart3 className="h-5 w-5 text-[color:var(--accent-gold)]" />
          Topics where students struggled
        </h2>
      </div>

      <div className="space-y-3">
        <div className="aseel-card p-4 md:hidden">
          {dashboard.topics.length > 0 ? (
            <div className="space-y-3">
              {dashboard.topics.map((row) => (
                <article key={row.topic} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-4">
                  <div className="text-sm font-semibold text-[color:var(--text-primary)]">{row.topic}</div>
                  <div className="mt-3 grid gap-2">
                    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Class avg score</div>
                      <div className="mt-1 text-sm text-[color:var(--accent-gold)]">{row.score}</div>
                    </div>
                    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Suggested action</div>
                      <div className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">{row.action}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-sm leading-7 text-[color:var(--text-secondary)]">
              No review topics yet. Once students submit work, the most important class gaps will appear here.
            </div>
          )}
        </div>

        <div className="hidden md:block aseel-card overflow-x-auto p-0">
          {dashboard.topics.length > 0 ? (
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.4fr_.8fr_1fr] border-b border-[color:var(--border)] bg-[color:var(--bg-primary)]/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
                <div>Topic</div>
                <div>Class Avg Score</div>
                <div>Suggested Action</div>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {dashboard.topics.map((row) => (
                  <div key={row.topic} className="grid grid-cols-[1.4fr_.8fr_1fr] gap-4 px-5 py-4 text-sm leading-6">
                    <div className="font-semibold text-[color:var(--text-primary)]">{row.topic}</div>
                    <div className="text-[color:var(--accent-gold)]">{row.score}</div>
                    <div className="text-[color:var(--text-secondary)]">{row.action}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm leading-7 text-[color:var(--text-secondary)]">
              No review topics yet. Once students submit work, the most important class gaps will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="aseel-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Why this helps</div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--text-primary)]">
            Teachers can spot class-wide gaps without seeing individual student data.
          </p>
        </div>
        <div className="aseel-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Best next step</div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--text-primary)]">
            Turn one topic into a guided discussion and one into a short peer-teach activity.
          </p>
        </div>
        <div className="aseel-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Signal, not suspicion</div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--text-primary)]">
            Aseel is designed to show where thinking is thin, not who to punish.
          </p>
        </div>
      </div>
    </section>
  );
}

function SubjectBreakdownSection({ dashboard }: { dashboard: TeacherDashboardData }) {
  return (
    <section id="subjects" className="space-y-5">
      <div>
        <div className="aseel-section-kicker">Subject Breakdown</div>
        <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Original thinking by subject</h2>
      </div>

      <div className="aseel-card space-y-4 p-4 sm:p-5">
        {dashboard.subjectBreakdown.map((subject, index) => (
          <div key={subject.label} className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[color:var(--text-primary)]">{subject.label}</span>
              <span className="text-[color:var(--accent-gold)]">{subject.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[color:var(--bg-primary)]/70">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subject.value}%` }}
                transition={{ duration: 0.9, delay: index * 0.08 }}
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent-gold)] to-[color:var(--accent-gold-light)]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentsSection({ dashboard }: { dashboard: TeacherDashboardData }) {
  const [students, setStudents] = useState<TeacherStudentRow[]>(dashboard.students);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [invitingStudentId, setInvitingStudentId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function buildInviteLink(student: TeacherStudentRow) {
    return buildStudentInviteLink(window.location.origin, student);
  }

  async function sendInvite(student: TeacherStudentRow, options?: { quiet?: boolean }) {
    setInvitingStudentId(student.id);

    try {
      const response = await fetch(`/api/classroom/students/${student.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Could not send invite.');
      }

      const inviteResult = data as StudentInviteEmailResult & { student?: TeacherStudentRow };

      if (!options?.quiet) {
        setError('');
        setStatus(
          inviteResult.deliveryMode === 'test'
            ? `Invite for ${student.email} sent to your Resend test inbox.`
            : `Invite email sent to ${inviteResult.recipientEmail}.`,
        );
      }

      return inviteResult;
    } finally {
      setInvitingStudentId(null);
    }
  }

  async function handleAddStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = studentEmail.trim();
    if (!trimmedEmail) {
      setError('Enter a student email address.');
      return;
    }

    setIsSaving(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/classroom/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: studentName,
          email: trimmedEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Could not add student.');
      }

      const savedStudent = data?.student as TeacherStudentRow | undefined;
      if (!savedStudent) {
        throw new Error('Could not add student.');
      }

      setStudents((current) => [
        savedStudent,
        ...current.filter((item) => item.email.toLowerCase() !== savedStudent.email.toLowerCase()),
      ]);
      setStudentName('');
      setStudentEmail('');

      try {
        const inviteResult = await sendInvite(savedStudent, { quiet: true });
        setStatus(
          inviteResult.deliveryMode === 'test'
            ? `${savedStudent.email} has been added and sent to your Resend test inbox.`
            : `${savedStudent.email} has been added and emailed.`,
        );
      } catch (inviteError) {
        setStatus(
          `${savedStudent.email} has been added, but the email could not be sent yet. ${inviteError instanceof Error ? inviteError.message : ''}`.trim(),
        );
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not add student.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendInvite(student: TeacherStudentRow) {
    try {
      await sendInvite(student);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Could not send invite.');
    }
  }

  async function handleCopyLink(student: TeacherStudentRow) {
    const inviteLink = buildInviteLink(student);
    await navigator.clipboard.writeText(inviteLink);
    setStatus(`Signup link copied for ${student.email}.`);
  }

  const activeCount = students.filter((student) => student.status === 'active').length;
  const statusIsError = /could not|failed|error/i.test(status);

  return (
    <section id="students" className="space-y-5">
      <div>
        <div className="aseel-section-kicker">Students</div>
        <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Add students by email</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
          Add a student email to your class roster, then Aseel sends a real signup email through Resend.
          When that student registers with the same email, Aseel marks them active automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="aseel-card p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Roster size</div>
          <div className="mt-3 font-display text-3xl text-[color:var(--text-primary)] sm:text-4xl">{students.length}</div>
        </article>
        <article className="aseel-card p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Active students</div>
          <div className="mt-3 font-display text-3xl text-[color:var(--success)] sm:text-4xl">{activeCount}</div>
        </article>
        <article className="aseel-card p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">Pending invites</div>
          <div className="mt-3 font-display text-3xl text-[color:var(--accent-gold)] sm:text-4xl">{students.length - activeCount}</div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleAddStudent} className="aseel-card space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-primary)]">
            <UserPlus className="h-4 w-4 text-[color:var(--accent-gold)]" />
            Invite a student
          </div>

          {error ? (
            <div className="rounded-2xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Student name</label>
            <input
              className="aseel-input"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Student email</label>
            <input
              className="aseel-input"
              type="email"
              value={studentEmail}
              onChange={(event) => setStudentEmail(event.target.value)}
              placeholder="student@school.edu"
            />
          </div>

          <button type="submit" disabled={isSaving} className="aseel-button-gold w-full disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Add to roster
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>

          <p className="text-xs leading-5 text-[color:var(--text-muted)]">
            Students do not need a separate school code. Their email is matched automatically when they create an Aseel account.
          </p>

          {status ? (
            <p
              className={[
                'rounded-2xl px-4 py-3 text-sm text-[color:var(--text-secondary)]',
                statusIsError
                  ? 'border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10'
                  : 'border border-[color:var(--success)]/20 bg-[color:var(--success)]/10',
              ].join(' ')}
            >
              {status}
            </p>
          ) : null}
        </form>

        <div className="aseel-card p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--text-primary)]">
            <Mail className="h-4 w-4 text-[color:var(--accent-gold)]" />
            Current roster
          </div>

          {students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student) => {
                const isActive = student.status === 'active';

                return (
                  <article key={student.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[color:var(--text-primary)]">{student.name}</div>
                        <div className="mt-1 text-sm text-[color:var(--text-secondary)]">{student.email}</div>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                        {isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" /> : <Clock3 className="h-3.5 w-3.5 text-[color:var(--accent-gold)]" />}
                        {isActive ? 'Active' : 'Invited'}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => void handleSendInvite(student)}
                        disabled={invitingStudentId === student.id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {invitingStudentId === student.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                        {student.status === 'active' ? 'Resend email invite' : 'Send email invite'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopyLink(student)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)] sm:w-auto"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy signup link
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg-primary)]/50 p-5 text-sm leading-7 text-[color:var(--text-secondary)]">
              No students yet. Add an email to start building your class roster.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  return (
    <section id="resources" className="space-y-5">
      <div>
        <div className="aseel-section-kicker">Resources</div>
        <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Support materials</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {teacherResources.map((resource) => {
          const Icon = resource.external ? ExternalLink : Download;

          return (
            <article key={resource.slug} className="aseel-card flex h-full flex-col p-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                {resource.eyebrow}
              </div>
               <h3 className="mt-4 font-display text-xl text-[color:var(--text-primary)] sm:text-2xl">{resource.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{resource.detail}</p>
              <div className="mt-4">
                {resource.external ? (
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-gold)]"
                  >
                    {resource.action}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <a href={resource.href} download className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-gold)]">
                    {resource.action}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface TeacherDashboardProps {
  data?: TeacherDashboardData;
  currentUser?: AuthUser;
}

export function TeacherDashboard(props: TeacherDashboardProps) {
  return <TeacherDashboardView {...props} />;
}

function TeacherDashboardView({ data, currentUser }: TeacherDashboardProps) {
  const dashboard = data ?? fallbackDashboardData;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-[color:var(--border)] bg-[color:var(--bg-secondary)]/30 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-2xl text-[color:var(--accent-gold)]">أصيل</div>
            <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">Aseel</div>
          </div>
        </Link>

        <nav className="mt-10 space-y-2">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="block rounded-2xl border border-transparent px-4 py-3 text-sm text-[color:var(--text-secondary)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--bg-primary)]/50 hover:text-[color:var(--text-primary)]"
            >
              {tab.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 p-4 text-sm text-[color:var(--text-secondary)]">
          <div className="text-[color:var(--text-primary)]">{currentUser?.name ?? 'Ms. Al-Mansouri'}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.24em]">
            {currentUser ? currentUser.email : 'Mock teacher profile'}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <div className="border-b border-[color:var(--border)] bg-[color:var(--bg-primary)]/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-xl text-[color:var(--accent-gold)]">أصيل</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">Teacher Dashboard</div>
              </div>
            </Link>

            <Link href="/auth?role=student&next=/student" className="aseel-button-ghost px-3 py-2 text-xs">
              Student Mode
            </Link>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition',
                  activeTab === tab.id
                    ? 'border-[color:var(--accent-gold)] bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]'
                    : 'border-[color:var(--border)] bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="aseel-section-kicker">Teacher Dashboard</div>
                <h1 className="mt-3 font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">Class-level trends</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  Aseel gives teachers signal, not suspicion.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="#students" className="aseel-button-gold w-full sm:w-auto">
                  Add Students
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                  <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                    <OverviewSection dashboard={dashboard} />
                  </motion.div>
                ) : null}
                {activeTab === 'reports' ? (
                  <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                    <ReportsSection dashboard={dashboard} />
                  </motion.div>
                ) : null}
                {activeTab === 'subjects' ? (
                  <motion.div key="subjects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                    <SubjectBreakdownSection dashboard={dashboard} />
                  </motion.div>
                ) : null}
                {activeTab === 'students' ? (
                  <motion.div key="students" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                    <StudentsSection dashboard={dashboard} />
                  </motion.div>
                ) : null}
                {activeTab === 'resources' ? (
                  <motion.div key="resources" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                    <ResourcesSection />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="hidden space-y-8 lg:block">
              <OverviewSection dashboard={dashboard} />
              <ReportsSection dashboard={dashboard} />
              <SubjectBreakdownSection dashboard={dashboard} />
              <StudentsSection dashboard={dashboard} />
              <ResourcesSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
