import type { TeacherResource } from '@/lib/types';

export const subjectOptions = [
  'English',
  'Arabic',
  'Science',
  'Math',
  'History',
  'Social Studies',
  'Other',
] as const;

export const loadingMessages = [
  'Reading your work...',
  'Finding where to dig deeper...',
  'Crafting questions just for you...',
  'Almost ready...',
] as const;

export const demoEssay = `The Industrial Revolution was a very important period in history. It changed many things about how people lived and worked. Many factories were built and people moved from the countryside to cities. This caused both positive and negative effects on society. The positive effects included more jobs and economic growth. The negative effects included pollution and poor working conditions. Overall, the Industrial Revolution had a significant impact on the modern world and shaped the economy we have today.`;

export const declarationUseOptions = [
  'I used AI to brainstorm ideas',
  'I used AI to check grammar/spelling',
  "I used AI to explain a concept I didn't understand",
  'I used AI to suggest structure/outline',
  'I used AI to translate text',
  'I did NOT use AI in this assignment',
] as const;

export const teacherOverviewCards = [
  { label: 'Students Analyzed This Week', value: '47' },
  { label: 'Avg Integrity Score', value: '71/100', meta: '↑ 8 from last week' },
  { label: 'Topics Needing Review', value: '3' },
  { label: 'Most Improved', value: 'Grade 11B' },
] as const;

export const teacherTrend = [58, 64, 69, 71] as const;

export const teacherSubjectBreakdown = [
  { label: 'English', value: 74 },
  { label: 'Science', value: 68 },
  { label: 'History', value: 61 },
  { label: 'Arabic', value: 82 },
  { label: 'Math', value: 88 },
] as const;

export const teacherTopics = [
  {
    topic: 'Industrial Revolution causes',
    score: 54,
    action: 'Consider in-class discussion',
  },
  {
    topic: 'Climate change effects',
    score: 61,
    action: 'Assign more primary sources',
  },
  {
    topic: 'Quadratic equations (word problems)',
    score: 67,
    action: 'Peer explanation activity',
  },
] as const;

export const teacherResources = [
  {
    slug: 'classroom-guide',
    eyebrow: 'Quick start',
    title: 'How to use Aseel in your classroom',
    detail: 'A practical classroom flow for introducing Aseel, discussing answers, and closing with reflection.',
    action: 'Download guide',
    href: '/api/resources/classroom-guide',
  },
  {
    slug: 'ai-learning-guide',
    eyebrow: 'Teaching toolkit',
    title: 'Guide to AI-assisted learning',
    detail: 'A teacher checklist for safe AI use, assignment design, and student reflection prompts.',
    action: 'Download guide',
    href: '/api/resources/ai-learning-guide',
  },
  {
    slug: 'uae-moe-guidelines',
    eyebrow: 'Official source',
    title: 'UAE MoE AI Guidelines 2025-26',
    detail: 'Open the Ministry reference site before updating school policy or parent guidance.',
    action: 'Open link',
    href: 'https://www.moe.gov.ae',
    external: true,
  },
] satisfies readonly TeacherResource[];
