import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getAuthUserFromSession } from '@/lib/auth';
import { normalizeAnalysisResult } from '@/lib/api-response';
import { buildMockAnalysis } from '@/lib/mock-analysis';
import { saveAnalysisSubmission } from '@/lib/student-store';
import type { AnalyzeRequest, AnalysisResult } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const systemPrompt = `You are Aseel, an AI academic integrity coach for UAE students aged 11-18.
Your job is NOT to catch cheaters. Your job is to help students prove they genuinely understand their own work by asking Socratic questions.

CRITICAL RULES:
1. NEVER tell a student to "rewrite" anything or "hide AI use"
2. NEVER use the word "AI-generated" in your feedback
3. ALWAYS frame flags as opportunities to demonstrate understanding, not as accusations
4. Questions must require the student to draw on genuine personal knowledge, reasoning, or experience
5. Be encouraging and educational in tone - like a supportive teacher, not a detective
6. Consider that students may be ESL or writing in a second language - flag thinking quality, not language quality

SCORING:
- integrityScore measures "original thinking" NOT "AI use"
- A well-written essay with personal examples and clear reasoning = high score
- Generic claims, passive voice without justification, unsupported assertions = lower score
- Good grammar and structure alone should NOT lower the score

SOCRATIC QUESTION RULES:
- Each question must be specific to the exact excerpt being analyzed.
- Do not reuse canned or generic question templates.
- Questions should reference a concrete word, idea, evidence point, or concept from the student text.
- Never say: "Rewrite this in your own words" or "This appears AI-generated".`;

function tryParseAnalysis(raw: string) {
  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;

  const parsed = JSON.parse(jsonText) as Partial<AnalysisResult>;

  if (
    typeof parsed.overallFeedback !== 'string' ||
    typeof parsed.integrityScore !== 'number' ||
    !Array.isArray(parsed.positives) ||
    !Array.isArray(parsed.sections) ||
    typeof parsed.subjectTip !== 'string'
  ) {
    throw new Error('Invalid analysis shape');
  }

  return parsed as AnalysisResult;
}

function normalizeRequest(body: unknown): AnalyzeRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.text !== 'string' ||
    typeof candidate.subject !== 'string' ||
    (candidate.language !== 'en' && candidate.language !== 'ar')
  ) {
    return null;
  }

  return {
    text: candidate.text,
    subject: candidate.subject,
    language: candidate.language,
    studentId: typeof candidate.studentId === 'string' ? candidate.studentId : undefined,
    studentName: typeof candidate.studentName === 'string' ? candidate.studentName : undefined,
  };
}

function resolveOpenAiApiKey() {
  const envKey = process.env.OPENAI_API_KEY?.trim();

  if (envKey) {
    return envKey;
  }

  const localKeyPath = resolve(process.cwd(), 'vs.txt');
  if (existsSync(localKeyPath)) {
    return readFileSync(localKeyPath, 'utf8').trim();
  }

  return '';
}

function shouldUseMockFallback() {
  return process.env.VERCEL !== '1';
}

function buildOpenAiErrorMessage(status: number, data: unknown) {
  const message =
    data && typeof data === 'object' && 'error' in data && data.error && typeof (data as { error?: { message?: unknown } }).error?.message === 'string'
      ? (data as { error: { message: string } }).error.message
      : '';

  if (status === 401 || status === 403) {
    return 'OpenAI authentication failed. Check the API key configured in Vercel.';
  }

  if (status === 429) {
    return 'OpenAI quota was exceeded. Add billing or try again later.';
  }

  if (status >= 500) {
    return 'OpenAI is temporarily unavailable. Try again later.';
  }

  if (status >= 400) {
    return message || 'OpenAI request was rejected. Check the model and request format.';
  }

  return message || 'OpenAI request failed.';
}

async function resolveAnalysis(requestBody: AnalyzeRequest): Promise<AnalysisResult> {
  const apiKey = resolveOpenAiApiKey();

  if (!apiKey) {
    if (shouldUseMockFallback()) {
      return normalizeAnalysisResult(buildMockAnalysis(requestBody));
    }

    throw new Error('OpenAI is not configured for this deployment.');
  }

  try {
    const userPrompt = `Analyze this ${requestBody.subject} assignment written by a UAE student:

---
${requestBody.text}
---

Respond ONLY with valid JSON matching this exact structure:
{
  "overallFeedback": "2-3 sentence encouraging assessment of the work's original thinking",
  "integrityScore": 0,
  "positives": ["thing done well 1", "thing done well 2", "thing done well 3"],
  "sections": [
    {
      "id": "s1",
      "excerpt": "<exact quote from text, max 80 chars>",
      "concern": "high|medium|low",
      "reason": "Why Aseel wants to explore this section further (1 sentence, encouraging tone)",
      "questions": [
        "Socratic question 1?",
        "Socratic question 2?",
        "Socratic question 3?"
      ]
    }
  ],
  "subjectTip": "One specific tip relevant to ${requestBody.subject} assignments"
}

Return 2-4 sections maximum. If the work scores above 85, return 1-2 sections.
If language is "ar", write all questions, feedback, and tips in Arabic.
Return ONLY the JSON object, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(buildOpenAiErrorMessage(response.status, data));
    }

    const rawText = data?.choices?.[0]?.message?.content;

    if (typeof rawText !== 'string' || !rawText.trim()) {
      throw new Error('OpenAI response was empty');
    }

    return normalizeAnalysisResult(tryParseAnalysis(rawText));
  } catch (error) {
    if (shouldUseMockFallback()) {
      return normalizeAnalysisResult(buildMockAnalysis(requestBody));
    }

    console.error('OpenAI analysis failed', error);
    throw error instanceof Error ? error : new Error('The analysis service is temporarily unavailable.');
  }
}

export async function POST(request: NextRequest) {
  const body = normalizeRequest(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const currentUser = getAuthUserFromSession(request.cookies.get(AUTH_SESSION_COOKIE)?.value);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (currentUser.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const text = body.text.trim();

  if (text.length < 50) {
    return NextResponse.json({ error: 'Please paste at least a paragraph of your work.' }, { status: 400 });
  }

  const requestBody: AnalyzeRequest = {
    text: text.slice(0, 5000),
    subject: body.subject,
    language: body.language,
    studentId: currentUser.id,
    studentName: currentUser.name,
  };

  try {
    const analysis = await resolveAnalysis(requestBody);

    try {
      await saveAnalysisSubmission(requestBody, analysis);
    } catch (error) {
      console.error('Failed to persist analysis', error);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis failed', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'The analysis service is temporarily unavailable.',
      },
      { status: 503 },
    );
  }
}
