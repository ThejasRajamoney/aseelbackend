'use client';

import { ArrowRight, Copy, Download, FileText, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { declarationUseOptions, subjectOptions } from '@/lib/site-data';

type Subject = (typeof subjectOptions)[number];

interface DeclarationGeneratorProps {
  initialStudentName?: string;
}

function buildDeclarationText(
  studentName: string,
  assignmentTitle: string,
  subject: Subject,
  uses: string[],
  description: string,
) {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const bulletPoints = uses.length > 0 ? uses : ['No AI use selected'];

  return `AI USE DECLARATION
──────────────────────────────────────
Student: ${studentName || '[name]'}
Assignment: ${assignmentTitle || '[title]'}
Subject: ${subject}
Date: ${date}

This student declares that AI tools were used in the following ways:
${bulletPoints.map((item) => `• ${item}`).join('\n')}

Additional context: ${description.trim() || 'Not provided.'}

This declaration was generated using Aseel - an AI Academic Integrity
Coach built for UAE schools. The student confirms this represents an
honest account of their AI use in this assignment.
──────────────────────────────────────`;
}

export function DeclarationGenerator({ initialStudentName = '' }: DeclarationGeneratorProps) {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('English');
  const [selectedUses, setSelectedUses] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [generated, setGenerated] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  function toggleUse(option: string) {
    setSelectedUses((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  function handleGenerate() {
    setGenerated(buildDeclarationText(studentName, assignmentTitle, subject, selectedUses, description));
    setCopyStatus('idle');
  }

  async function handleCopy() {
    const text = generated || buildDeclarationText(studentName, assignmentTitle, subject, selectedUses, description);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1400);
    } catch (error) {
      console.error('Could not copy declaration', error);
      setCopyStatus('idle');
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    setStudentName(initialStudentName);
    setAssignmentTitle('');
    setSubject('English');
    setSelectedUses([]);
    setDescription('');
    setGenerated('');
    setCopyStatus('idle');
  }

  return (
    <main className="aseel-shell py-6 sm:py-12">
      <div className="mx-auto max-w-[700px] space-y-6">
        <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="aseel-section-kicker">AI Use Declaration</div>
            <h1 className="mt-3 font-display text-3xl text-[color:var(--text-primary)] sm:text-5xl">Generate an honest declaration</h1>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              Aseel turns your AI use into a clean, printable declaration.
            </p>
          </div>

          <Link href="/" className="aseel-button-ghost w-full sm:w-auto">
            Back Home
          </Link>
        </div>

        <section className="aseel-card no-print space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Student Name</label>
              <input className="aseel-input" value={studentName} onChange={(event) => setStudentName(event.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Assignment Title</label>
              <input className="aseel-input" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Subject</label>
              <select className="aseel-input" value={subject} onChange={(event) => setSubject(event.target.value as Subject)}>
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
              How did you use AI?
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {declarationUseOptions.map((option) => {
                const checked = selectedUses.includes(option);

                return (
                  <label
                    key={option}
                    className={[
                      'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 transition',
                      checked
                        ? 'border-[color:var(--accent-gold)] bg-[color:var(--accent-gold)]/10 text-[color:var(--text-primary)]'
                        : 'border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 text-[color:var(--text-secondary)]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUse(option)}
                      className="mt-1 h-4 w-4 rounded border-[color:var(--border)] bg-transparent text-[color:var(--accent-gold)] focus:ring-[color:var(--accent-gold)]/30"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">
              Describe your AI use in your own words
            </label>
            <textarea
              className="aseel-input min-h-[150px] resize-y"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context..."
            />
          </div>

          <button type="button" onClick={handleGenerate} className="aseel-button-gold w-full">
            Generate Declaration
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {generated ? (
          <section className="print-card aseel-card space-y-5 p-5 sm:p-6">
            <div className="no-print flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">Declaration Preview</div>
                  <div className="text-sm text-[color:var(--text-secondary)]">Ready to copy or print</div>
                </div>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <button type="button" onClick={handleCopy} className="aseel-button-ghost w-full sm:w-auto">
                  <Copy className="h-4 w-4" />
                  {copyStatus === 'copied' ? 'Copied' : 'Copy to Clipboard'}
                </button>
                <button type="button" onClick={handlePrint} className="aseel-button-ghost w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Download as PDF
                </button>
                <button type="button" onClick={handleReset} className="aseel-button-ghost w-full sm:w-auto">
                  <RefreshCcw className="h-4 w-4" />
                  Start Over
                </button>
              </div>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-[color:var(--text-primary)]">{generated}</pre>
          </section>
        ) : null}
      </div>
    </main>
  );
}
