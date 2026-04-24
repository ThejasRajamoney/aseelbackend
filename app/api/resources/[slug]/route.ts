import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resourceFiles = {
  'classroom-guide': {
    filename: 'aseel-classroom-guide.md',
    content: `# How to use Aseel in your classroom

## Quick flow
1. Ask students to paste their draft.
2. Use the score as a discussion starter, not a label.
3. Have students answer one question in their own words.
4. Close with a short reflection or declaration.

## Teacher tips
- Focus on reasoning, evidence, and personal understanding.
- Encourage students to add one concrete example.
- Use the feedback to plan a mini-conference or peer discussion.
`,
  },
  'ai-learning-guide': {
    filename: 'aseel-ai-learning-guide.md',
    content: `# Guide to AI-assisted learning

## Classroom checklist
- Explain what students may and may not ask AI to do.
- Ask for a short AI-use declaration.
- Require at least one sentence of personal reasoning.
- Review the final answer with a reflective question.

## Strong practice
- Use AI for brainstorming, not replacing thought.
- Compare an AI draft with the student's own explanation.
- Ask students to cite their own evidence and examples.
`,
  },
} as const;

type ResourceKey = keyof typeof resourceFiles;

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const resource = resourceFiles[params.slug as ResourceKey];

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  return new NextResponse(resource.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${resource.filename}"`,
    },
  });
}
