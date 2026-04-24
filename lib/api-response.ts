import type { AnalysisResult } from '@/lib/types';

export function normalizeAnalysisResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    integrityScore: Math.max(0, Math.min(100, Math.round(result.integrityScore))),
    positives: result.positives.slice(0, 3),
    sections: result.sections.slice(0, 4).map((section, index) => ({
      ...section,
      id: section.id || `s${index + 1}`,
      excerpt: section.excerpt.slice(0, 100),
      questions: section.questions.slice(0, 3),
    })),
  };
}
