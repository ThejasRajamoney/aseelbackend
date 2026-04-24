import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getAuthUserFromSession } from '@/lib/auth';
import type { AnswerReviewRequest, AnswerReviewResult } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function normalizeRequest(body: unknown): AnswerReviewRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.question !== 'string' ||
    typeof candidate.answer !== 'string' ||
    typeof candidate.excerpt !== 'string' ||
    typeof candidate.subject !== 'string' ||
    (candidate.language !== 'en' && candidate.language !== 'ar')
  ) {
    return null;
  }

  return {
    question: candidate.question,
    answer: candidate.answer,
    excerpt: candidate.excerpt,
    subject: candidate.subject,
    language: candidate.language,
  };
}

function isStrongAnswer(answer: string, language: AnswerReviewRequest['language']) {
  const text = answer.trim();
  if (!text) {
    return false;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).map((segment) => segment.trim()).filter(Boolean).length;

  if (language === 'ar') {
    return (
      wordCount >= 10 &&
      sentenceCount >= 1 &&
      /(?:لأن|مثال|دليل|أعتقد|أرى|هذا يعني|بسبب|نتيجة|السبب|يوضح|يدل)/i.test(text)
    );
  }

  return (
    wordCount >= 12 &&
    sentenceCount >= 1 &&
    /(?:because|for example|for instance|this shows|which means|my experience|I think|I believe|in my view|evidence|according to|as a result)/i.test(text)
  );
}

function buildPerfectReview({ question, excerpt, subject, language }: AnswerReviewRequest): AnswerReviewResult {
  const focus = excerpt.split(/\s+/).slice(0, 6).join(' ').replace(/[.,;:!?]+$/g, '');

  return language === 'ar'
    ? {
        summary: `إجابتك عن "${focus || subject}" واضحة ومكتملة وتُظهر فهمًا جيدًا. ممتازة.`,
        improvement: '',
        isPerfect: true,
      }
    : {
        summary: `Your answer fully addresses "${focus || question}" with clear reasoning and support. Perfect.`,
        improvement: '',
        isPerfect: true,
      };
}

function buildFallbackReview({ answer, question, excerpt, subject, language }: AnswerReviewRequest): AnswerReviewResult {
  const text = answer.trim();
  const focus = excerpt.split(/\s+/).slice(0, 6).join(' ').replace(/[.,;:!?]+$/g, '');

  if (!text) {
    return language === 'ar'
      ? {
          summary: 'لم تبدأ الإجابة بعد.',
          improvement: 'اكتب فكرتك الأولى أو مثالًا بسيطًا مرتبطًا بالسؤال.',
          isPerfect: false,
        }
      : {
          summary: 'No answer yet.',
          improvement: 'Type your first idea or a simple example connected to the question.',
          isPerfect: false,
        };
  }

  if (text.length < 45) {
    return language === 'ar'
      ? {
          summary: 'الإجابة جيدة كبداية لكنها قصيرة جدًا.',
          improvement: 'أضف مثالًا محددًا أو اشرح السبب بشكل أوضح.',
          isPerfect: false,
        }
      : {
          summary: 'This is a good start, but it is still brief.',
          improvement: 'Add one specific example or explain your reason more clearly.',
          isPerfect: false,
        };
  }

  if (isStrongAnswer(text, language)) {
    return buildPerfectReview({ answer, question, excerpt, subject, language });
  }

  const mentionsEvidence = /(because|for example|for instance|I noticed|my experience|I think|this shows|which means|evidence|evidence from)/i.test(text);

  if (language === 'ar') {
    return mentionsEvidence
      ? {
          summary: `الإجابة مرتبطة بـ"${focus || subject}" وتظهر فهمًا جيدًا.` ,
          improvement: 'أضف تفصيلًا إضافيًا أو دليلًا أقوى يجعل الفكرة أكثر إقناعًا.',
          isPerfect: false,
        }
      : {
          summary: `الإجابة تعالج "${focus || question}" لكنها ما زالت عامة قليلًا.`,
          improvement: 'أضف دليلًا أو مثالًا شخصيًا يوضح تفكيرك بشكل أقوى.',
          isPerfect: false,
        };
  }

  return mentionsEvidence
    ? {
        summary: `Your answer connects well to "${focus || subject}" and shows clear thinking.`,
        improvement: 'Add one more concrete detail or piece of evidence to make it stronger.',
        isPerfect: false,
      }
    : {
        summary: `Your answer addresses "${focus || question}" but still sounds general.`,
        improvement: 'Add a specific example, reason, or piece of evidence from the text or your own experience.',
        isPerfect: false,
      };
}

async function resolveReview(requestBody: AnswerReviewRequest): Promise<AnswerReviewResult> {
  const apiKey = resolveOpenAiApiKey();

  if (!apiKey) {
    return buildFallbackReview(requestBody);
  }

  try {
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
          {
            role: 'system',
            content:
              'You are Aseel, an encouraging academic coach for UAE students. Analyze a student answer and return ONLY JSON with summary, improvement, and isPerfect. The summary must say what is working. If the answer is complete, specific, and strong enough, set isPerfect to true and make improvement an empty string. If it still needs work, set isPerfect to false and give one concrete next step. Be specific to the answer and question. Never mention AI, rewrite, or detection. Keep the tone supportive.',
          },
          {
            role: 'user',
            content: `Question: ${requestBody.question}\n\nSection excerpt: ${requestBody.excerpt}\n\nStudent answer: ${requestBody.answer}\n\nSubject: ${requestBody.subject}\nLanguage: ${requestBody.language}`,
          },
        ],
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error?.message || 'OpenAI request failed');
    }

    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== 'string' || !raw.trim()) {
      throw new Error('OpenAI response was empty');
    }

    const parsed = JSON.parse(raw) as Partial<AnswerReviewResult>;

    if (typeof parsed.summary !== 'string') {
      throw new Error('Invalid review shape');
    }

    if (isStrongAnswer(requestBody.answer, requestBody.language)) {
      return buildPerfectReview(requestBody);
    }

    if (typeof parsed.improvement !== 'string') {
      throw new Error('Invalid review shape');
    }

    return {
      summary: parsed.summary,
      improvement: parsed.improvement,
      isPerfect: parsed.isPerfect === true,
    };
  } catch {
    return buildFallbackReview(requestBody);
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

  const review = await resolveReview(body);

  return NextResponse.json(review);
}
