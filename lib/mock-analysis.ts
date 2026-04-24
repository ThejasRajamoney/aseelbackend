import type { AnalyzeRequest, AnalysisLanguage, AnalysisResult, AnalysisSection, ConcernLevel } from '@/lib/types';

const englishSubjectTips: Record<string, string> = {
  English: 'Add one short example that shows how you reached each main point.',
  Arabic: 'Show how your interpretation connects to the text or prompt.',
  Science: 'Link each claim to an observation, experiment, or concept you studied.',
  Math: 'Explain why each step works, not only what the answer is.',
  History: 'Name the cause, effect, and evidence that support your view.',
  'Social Studies': 'Use one local or real-world example to ground your argument.',
  Other: 'Show the reasoning behind each main idea in a specific way.',
};

const arabicSubjectTips: Record<string, string> = {
  English: 'أضف مثالًا قصيرًا يوضح كيف وصلت إلى كل فكرة رئيسية.',
  Arabic: 'أظهر كيف يرتبط تفسيرك بالنص أو بالسؤال.',
  Science: 'اربط كل ادعاء بملاحظة أو تجربة أو مفهوم درستَه.',
  Math: 'اشرح لماذا تعمل كل خطوة، وليس فقط ما هي الإجابة.',
  History: 'اذكر السبب والنتيجة والدليل الذي يدعم رأيك.',
  'Social Studies': 'استخدم مثالًا محليًا أو واقعيًا لتثبيت فكرتك.',
  Other: 'أظهر سبب كل فكرة رئيسية بطريقة محددة.',
};

const englishStopwords = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'were',
  'was',
  'are',
  'but',
  'have',
  'has',
  'had',
  'what',
  'when',
  'where',
  'how',
  'why',
  'who',
  'which',
  'their',
  'there',
  'they',
  'them',
  'into',
  'about',
  'over',
  'very',
  'many',
  'more',
  'most',
  'some',
  'such',
  'your',
  'you',
  'yourself',
  'people',
  'thing',
  'things',
  'important',
  'because',
  'would',
  'could',
  'should',
  'therefore',
]);

const arabicStopwords = new Set([
  'و',
  'في',
  'من',
  'على',
  'إلى',
  'عن',
  'هذا',
  'هذه',
  'ذلك',
  'تلك',
  'التي',
  'الذي',
  'الذين',
  'كانت',
  'كان',
  'يكون',
  'لكن',
  'مع',
  'أن',
  'إن',
  'كما',
  'قد',
  'ما',
  'ماذا',
  'كيف',
  'لماذا',
  'لأن',
  'أو',
  'ثم',
  'هناك',
  'هنا',
  'كل',
  'بعض',
  'أكثر',
  'أقل',
  'الناس',
  'شيء',
  'أشياء',
]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function extractKeywords(text: string, language: AnalysisLanguage) {
  const words = normalizeText(text)
    .toLowerCase()
    .match(language === 'ar' ? /[\u0600-\u06FF]+/g : /[a-z0-9']+/g) ?? [];

  const stopwords = language === 'ar' ? arabicStopwords : englishStopwords;
  const keywords: string[] = [];

  for (const word of words) {
    if (word.length < 4 && language === 'en') continue;
    if (stopwords.has(word)) continue;
    if (!keywords.includes(word)) {
      keywords.push(word);
    }
    if (keywords.length === 6) {
      break;
    }
  }

  return keywords;
}

function toTitleCasePhrase(words: string[]) {
  return words
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

const keywordNoise = new Set([
  'fascinating',
  'interesting',
  'important',
  'significant',
  'main',
  'overall',
  'various',
  'different',
  'many',
  'more',
  'most',
  'some',
  'much',
  'first',
  'second',
  'third',
  'one',
  'two',
  'three',
  'about',
  'section',
  'idea',
  'point',
  'topic',
  'things',
  'thing',
  'known',
  'clear',
  'strong',
  'simple',
  'basic',
]);

function pickQuestionKeywords(excerpt: string, language: AnalysisLanguage) {
  return extractKeywords(excerpt, language).filter((word) => !keywordNoise.has(word));
}

function buildQuestions(excerpt: string, subject: string, language: AnalysisLanguage) {
  const keywords = pickQuestionKeywords(excerpt, language);
  const focus = keywords[0] || subject;
  const detail = keywords[1] || focus;
  const evidenceTarget = keywords[2] || detail;

  if (language === 'ar') {
    return [
      `ما الفكرة الرئيسية حول "${focus}" في هذا الجزء؟`,
      `لماذا يهمُّ التفصيل المتعلق بـ"${detail}" هنا؟`,
      `ما المثال أو الدليل الذي يمكن أن يقوي فكرتك عن "${evidenceTarget}"؟`,
    ];
  }

  return [
    `What is the main idea about "${focus}" in this section?`,
    `Why does the detail about "${detail}" matter here?`,
    `What example or fact would make your idea about "${evidenceTarget}" stronger?`,
  ];
}

function splitIntoExcerpts(text: string) {
  const normalized = normalizeText(text);
  const paragraphs = text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const candidates = (paragraphs.length > 1
    ? paragraphs
    : normalized.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean)
  ).filter((segment) => segment.length > 20);

  const unique = Array.from(new Set(candidates));
  const source = unique.length > 0 ? unique : [normalized];

  return source.slice(0, 4).map((segment) => (segment.length > 80 ? `${segment.slice(0, 77).trim()}...` : segment));
}

function computeScore(text: string) {
  const lower = text.toLowerCase();
  let score = 46;

  const positiveSignals = [
    /\bi think\b/g,
    /\bi believe\b/g,
    /\bin my view\b/g,
    /\bfor example\b/g,
    /\bfor instance\b/g,
    /\bbecause\b/g,
    /\btherefore\b/g,
    /\bmy experience\b/g,
    /\bwhich means\b/g,
  ];

  positiveSignals.forEach((pattern) => {
    score += (lower.match(pattern)?.length ?? 0) * 4;
  });

  const broadSignals = [
    /very important/g,
    /many things/g,
    /significant impact/g,
    /overall/g,
    /shaped the world/g,
    /changed many things/g,
  ];

  broadSignals.forEach((pattern) => {
    score -= (lower.match(pattern)?.length ?? 0) * 3;
  });

  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  if (wordCount > 120) score += 8;
  if (wordCount > 220) score += 5;
  if (wordCount < 90) score -= 4;

  if ((lower.match(/\?/g)?.length ?? 0) > 0) score += 2;
  if ((lower.match(/\bexamples?\b/g)?.length ?? 0) > 0) score += 3;

  return clamp(Math.round(score), 24, 94);
}

function pickConcern(score: number, index: number): ConcernLevel {
  if (score >= 85) {
    return index === 0 ? 'medium' : 'low';
  }

  if (score >= 70) {
    return index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
  }

  return index === 0 ? 'high' : index === 1 ? 'high' : 'medium';
}

function buildPositives(text: string, language: AnalysisLanguage) {
  const lower = text.toLowerCase();
  const positives = language === 'ar'
    ? ['فيه فكرة واضحة وتدرج جيد.', 'يظهر أن النص يحاول شرح المفهوم بدل الاكتفاء بالسرد.', 'الكتابة تحافظ على موضوع واحد بشكل عام.']
    : ['The writing stays focused on one main topic.', 'There are signs of structure and progression.', 'The response shows room for personal reflection and growth.'];

  const enriched: string[] = [];

  if (lower.includes('for example') || lower.includes('for instance') || lower.includes('مثال')) {
    enriched.push(language === 'ar' ? 'تم دعم الفكرة بمثال واضح.' : 'You include examples that help support the idea.');
  }

  if (lower.includes('because') || lower.includes('لأن')) {
    enriched.push(language === 'ar' ? 'هناك محاولة لشرح السبب وراء بعض الأفكار.' : 'There is an attempt to explain why some ideas matter.');
  }

  if ((lower.match(/\b(i think|i believe|in my view|أعتقد|أرى)\b/g)?.length ?? 0) > 0) {
    enriched.push(language === 'ar' ? 'الصوت الشخصي يظهر في أكثر من موضع.' : 'Your personal voice appears in more than one place.');
  }

  return Array.from(new Set([...enriched, ...positives])).slice(0, 3);
}

function buildFeedback(score: number, language: AnalysisLanguage) {
  if (language === 'ar') {
    if (score >= 80) {
      return 'يبدو النص متماسكًا وفيه صوت شخصي واضح. توجد بعض المواضع التي تستفيد من توضيح أعمق، لكن الفكرة العامة قوية.';
    }

    if (score >= 50) {
      return 'النص يقدّم موضوعًا واضحًا وبنية مقبولة، لكن بعض الأفكار تبقى عامة. حاول أن تشرح لماذا تؤمن بكل نقطة وأن تضيف مثالًا أو تجربة خاصة بك.';
    }

    return 'الفكرة الرئيسية موجودة، لكن كثيرًا من العبارات تبقى عامة جدًا. قوِّ النص بشرح اختياراتك وإضافة دليل أو مثال يوضح تفكيرك.';
  }

  if (score >= 80) {
    return 'This feels thoughtful and clearly organized. Your ideas have a strong foundation, and a few spots would benefit from a little more explanation or personal evidence.';
  }

  if (score >= 50) {
    return 'The writing shows a clear topic and workable structure, but several ideas stay general. Add more of your own reasoning, examples, or reflection to make the thinking stronger.';
  }

  return 'The main idea is there, but much of the writing stays broad. Strengthen it by explaining your choices, adding evidence, and showing how you reached each point.';
}

function buildSubjectTip(subject: string, language: AnalysisLanguage) {
  const tip = language === 'ar' ? arabicSubjectTips[subject] : englishSubjectTips[subject];
  return tip ?? (language === 'ar'
    ? 'أضف تفصيلًا واحدًا يشرح كيف وصلت إلى فكرتك الأساسية.'
    : 'Add one concrete detail that shows how you reached your main idea.');
}

function buildSections(text: string, subject: string, language: AnalysisLanguage, score: number): AnalysisSection[] {
  const excerpts = splitIntoExcerpts(text);
  const targetCount = score >= 85 ? 2 : score >= 70 ? 3 : 4;
  const count = Math.min(targetCount, Math.max(2, excerpts.length));

  return excerpts.slice(0, count).map((excerpt, index) => ({
    id: `s${index + 1}`,
    excerpt,
    concern: pickConcern(score, index),
    reason:
      language === 'ar'
        ? 'يريد Aseel أن يستكشف هذا الجزء بشكل أعمق حتى يوضح فهمك الخاص.'
        : `Aseel wants to explore this ${subject.toLowerCase()} section a little further so your own understanding comes through clearly.`,
    questions: buildQuestions(excerpt, subject, language),
  }));
}

export function buildMockAnalysis({ text, subject, language }: AnalyzeRequest): AnalysisResult {
  const score = computeScore(text);

  return {
    overallFeedback: buildFeedback(score, language),
    integrityScore: score,
    positives: buildPositives(text, language),
    sections: buildSections(text, subject, language, score),
    subjectTip: buildSubjectTip(subject, language),
  };
}
