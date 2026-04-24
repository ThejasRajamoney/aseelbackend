import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StudentInviteEmailResult } from '@/lib/types';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveResendApiKey() {
  const envKey = process.env.RESEND_API_KEY?.trim();

  if (envKey) {
    return envKey;
  }

  const localKeyPath = resolve(process.cwd(), 'vs.txt');
  if (existsSync(localKeyPath)) {
    const content = readFileSync(localKeyPath, 'utf8');
    const match = content.match(/re_[A-Za-z0-9_-]{10,}/);

    if (match) {
      return match[0];
    }
  }

  return '';
}

function parseSender(fromValue: string) {
  const match = fromValue.match(/^(.*)<([^>]+)>$/);

  if (match) {
    return {
      from: fromValue.trim(),
      address: match[2].trim(),
    };
  }

  return {
    from: `Aseel <${fromValue.trim()}>`,
    address: fromValue.trim(),
  };
}

function resolveResendTestEmail() {
  const envEmail = process.env.RESEND_TEST_EMAIL?.trim();

  if (envEmail) {
    return envEmail;
  }

  const localKeyPath = resolve(process.cwd(), 'vs.txt');
  if (existsSync(localKeyPath)) {
    const content = readFileSync(localKeyPath, 'utf8');
    const matches = content.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    const fallback = matches.find((email) => email.toLowerCase() !== 'onboarding@resend.dev');

    if (fallback) {
      return fallback;
    }
  }

  return '';
}

function resolveResendConfig() {
  const apiKey = resolveResendApiKey();
  const rawFrom = process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev';
  const { from, address } = parseSender(rawFrom);
  const testEmail = resolveResendTestEmail();

  if (!apiKey) {
    throw new Error('Set RESEND_API_KEY or keep the fallback key in vs.txt to send email invites.');
  }

  return { apiKey, from, fromAddress: address, testEmail };
}

export interface StudentInviteEmailInput {
  teacherName: string;
  teacherEmail: string;
  studentName: string;
  studentEmail: string;
  inviteUrl: string;
}

export async function sendStudentInviteEmail(input: StudentInviteEmailInput) {
  const { apiKey, from, fromAddress, testEmail } = resolveResendConfig();
  const deliveryMode: 'test' | 'live' = fromAddress.toLowerCase() === 'onboarding@resend.dev' ? 'test' : 'live';
  const recipientEmail = deliveryMode === 'test' ? testEmail : input.studentEmail;

  if (deliveryMode === 'test' && !recipientEmail) {
    throw new Error('Add RESEND_TEST_EMAIL or your verified test email in vs.txt to use onboarding@resend.dev.');
  }

  const subject = `${input.teacherName} invited you to join Aseel`;
  const modeNote = deliveryMode === 'test' ? 'Test delivery to your verified inbox' : '';
  const text = [
    `Hi ${input.studentName || 'student'},`,
    '',
    `${input.teacherName} (${input.teacherEmail}) invited you to join Aseel.`,
    modeNote,
    'Use this link to sign in or create your account:',
    input.inviteUrl,
    '',
    'After you sign in, you can paste your work and get feedback from Aseel.',
  ].join('\n');

  const inviteLink = escapeHtml(input.inviteUrl);
  const teacherLine = `${escapeHtml(input.teacherName)} (${escapeHtml(input.teacherEmail)})`;
  const noteBlock = modeNote
    ? `<div style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:#fef3c7;color:#92400e;padding:6px 12px;font-size:12px;font-weight:700;">${escapeHtml(modeNote)}</div>`
    : '';

  const html = `
    <div style="margin:0;padding:0;background:#f7f7fb;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <div style="padding:28px 28px 0;background:linear-gradient(135deg,#111827 0%,#1f2937 100%);color:#f8fafc;">
            <div style="display:inline-flex;align-items:center;border-radius:999px;background:rgba(201,168,76,0.16);color:#f5d67f;padding:6px 12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Aseel</div>
            <h1 style="margin:18px 0 12px;font-size:30px;line-height:1.1;letter-spacing:-0.03em;">You&apos;re invited to Aseel</h1>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1;">Join your classroom workspace, sign in once, and start getting feedback on your own thinking.</p>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 10px;font-size:16px;line-height:1.7;">Hi ${escapeHtml(input.studentName || 'student')},</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">${teacherLine} invited you to join Aseel.</p>

            ${noteBlock ? `<div style="margin:0 0 22px;">${noteBlock}</div>` : ''}

            <div style="margin:28px 0;text-align:center;">
              <a href="${inviteLink}" style="display:inline-block;background:#c9a84c;color:#111827;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:14px;box-shadow:0 8px 20px rgba(201,168,76,0.25);">Sign in or create account</a>
            </div>

            <div style="margin:0 0 18px;padding:16px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc;">
              <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">If the button does not open</div>
              <div style="font-size:13px;line-height:1.6;color:#0f172a;word-break:break-all;"><a href="${inviteLink}" style="color:#2563eb;text-decoration:underline;">${inviteLink}</a></div>
            </div>

            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">After you sign in, you can paste your work and get feedback from Aseel.</p>
          </div>

          <div style="padding:0 28px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">
            Sent from Aseel classroom invites. Reply to ${escapeHtml(input.teacherEmail)} if you need help.
          </div>
        </div>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject,
      text,
      html,
      reply_to: input.teacherEmail,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error?.message || 'Email delivery failed.');
  }

  return {
    ...(data as { id?: string }),
    recipientEmail,
    deliveryMode,
  } satisfies StudentInviteEmailResult;
}
