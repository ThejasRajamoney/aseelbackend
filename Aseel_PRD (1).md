# Aseel (أصيل) — Product Requirements Document
### AI Academic Integrity Coach for UAE Students
**Version 1.0 | Safe AI Cup 2026 Submission**

---

## 1. PROJECT OVERVIEW

### What is Aseel?
Aseel is a web app that helps UAE students develop genuine academic integrity when using AI tools. Instead of detecting and punishing AI use, Aseel uses Socratic questioning to make students prove they actually understand what they submitted. If you understand your work, Aseel is easy. If you let AI write it for you without engaging, Aseel will expose that — not by flagging you, but by asking you questions you can't answer.

### The Core Insight
Every existing tool (Turnitin, GPTZero) asks: **"Did you cheat?"**
Aseel asks: **"Do you actually understand this?"**
You cannot bypass that second question by rewriting sentences.

### The Tagline
> *"Turnitin catches cheaters. Aseel builds thinkers."*

### Why This Wins the Competition
- Directly aligned with "Safe AI Cup" brand — making AI use in schools SAFE
- UAE-specific: links to Ministry of Education AI curriculum 2025-26 and UAE AI Strategy 2031
- Unique in the market — no existing tool uses Socratic coaching instead of detection
- Ethical by design: no student data stored, no profiling, constructive not punitive
- Supports UN SDG 4 (Quality Education), specifically Target 4.7

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |
| Backend | Next.js API Routes (serverless, no separate Express needed) |
| Data | No database. No user data stored. All analysis is stateless. Teacher dashboard uses mock/session data only. |

### Environment Variables
```env
ANTHROPIC_API_KEY=your_key_here
```

---

## 3. DESIGN SYSTEM

### Aesthetic Direction
**"UAE Premium Dark"** — Refined, trustworthy, academic. Like a high-end university portal built in the Gulf. NOT a generic startup SaaS. NOT purple gradients. NOT Inter font.

### Colors
```css
--bg-primary: #08111F        /* Deep navy — main background */
--bg-secondary: #0D1B2E      /* Slightly lighter navy — cards */
--bg-tertiary: #122340       /* Card hover states */
--accent-gold: #C9A84C       /* UAE gold — primary accent */
--accent-gold-light: #E8C97A /* Lighter gold — hover states */
--accent-teal: #2ABAAB       /* Teal — secondary accent, success states */
--text-primary: #F0EDE6      /* Warm white — main text */
--text-secondary: #A8A49C    /* Muted — secondary text */
--text-muted: #5C5850        /* Very muted — placeholders */
--border: #1E3250            /* Subtle border */
--danger: #E05C5C            /* Red flags */
--warning: #E09A3C           /* Yellow caution */
--success: #3CB878           /* Green clean */
```

### Typography
```css
/* Headings: Cormorant Garamond (import from Google Fonts) */
font-family: 'Cormorant Garamond', serif;

/* Body + UI: DM Sans (import from Google Fonts) */
font-family: 'DM Sans', sans-serif;

/* Monospace (code/AI output): JetBrains Mono */
font-family: 'JetBrains Mono', monospace;
```

Add to `layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

### UI Patterns
- Cards: `bg-[#0D1B2E] border border-[#1E3250] rounded-2xl`
- Gold buttons: `bg-[#C9A84C] hover:bg-[#E8C97A] text-[#08111F] font-semibold rounded-xl`
- Ghost buttons: `border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-xl`
- Input fields: `bg-[#0D1B2E] border border-[#1E3250] focus:border-[#C9A84C] text-[#F0EDE6] rounded-xl`
- Section dividers: subtle horizontal rule `border-[#1E3250]`
- Subtle background texture: add a very faint geometric pattern (CSS-only, repeating diagonal lines or dots) to the main background
- Glows: use `shadow-[0_0_40px_rgba(201,168,76,0.08)]` on highlighted cards

---

## 4. PAGE STRUCTURE

```
/                    → Landing Page
/student             → Student Mode (main feature)
/teacher             → Teacher Dashboard
/declare             → AI Use Declaration Generator
```

---

## 5. PAGE: LANDING PAGE (`/`)

### Purpose
Sell the concept in under 10 seconds. Look like a real product, not a school project.

### Sections (top to bottom)

#### 5.1 Navbar
- Logo: "أصيل" in gold Cormorant Garamond + "Aseel" subtitle in DM Sans
- Nav links: How It Works | For Students | For Teachers
- CTA button: "Try It Free" → links to `/student`
- Sticky, backdrop blur on scroll: `backdrop-blur-md bg-[#08111F]/80`

#### 5.2 Hero Section
- Eyebrow text (small caps, gold): `FOR UAE SCHOOLS · SAFE AI CUP 2026`
- Main headline (Cormorant Garamond, large, ~72px): 
  ```
  AI didn't write this.
  Can you prove yours didn't?
  ```
- Sub-headline (DM Sans, muted, ~20px):
  ```
  Aseel doesn't catch cheaters.
  It builds thinkers. Try pasting your next assignment.
  ```
- Two CTA buttons: "Try As Student →" (gold, filled) | "View Teacher Dashboard" (ghost)
- Background: deep navy with a very subtle gold geometric pattern (CSS only, low opacity)
- Optional: animated counter stats (mock data, CSS animation):
  - "2,400+ UAE students" | "18 Schools" | "94% said it improved their understanding"

#### 5.3 Problem Statement Section
Headline: `The real problem isn't AI. It's that nobody's teaching students how to use it right.`

Three cards in a row:
1. **"Detection doesn't teach"** — Turnitin flags work. It never explains why thinking matters.
2. **"Punishment doesn't work"** — 43% of students use AI tools regardless of policies.
3. **"Schools need a new approach"** — One that builds integrity instead of trying to catch its absence.

Each card: icon (Lucide) + title + 2-sentence description. Gold icon color.

#### 5.4 How It Works Section
Headline: `How Aseel Works`
Three steps with large step numbers (gold, Cormorant Garamond, ~120px, low opacity):

**Step 01 — Paste Your Work**
Student pastes any essay, paragraph, or assignment into Aseel.

**Step 02 — AI Reads Your Thinking**
Aseel's AI identifies sections that lack original voice, critical analysis, or specific understanding — the signs of AI-generated content.

**Step 03 — You Prove You Know It**
Instead of flagging you, Aseel asks you targeted Socratic questions about the sections it's uncertain about. If you can answer them, the work is yours. If you can't — now you know what to actually learn.

Layout: horizontal stepper on desktop, vertical on mobile.

#### 5.5 The Difference Section
Two-column comparison. Left: "Other tools". Right: "Aseel".

| | Other Tools | Aseel |
|---|---|---|
| Goal | Catch cheaters | Build thinkers |
| Method | Detect AI patterns | Socratic questioning |
| Student experience | Anxiety + punishment | Understanding + growth |
| Teacher value | Suspicion dashboard | Learning insights |
| Bias risk | High (flags ESL students) | Low (asks, doesn't judge) |
| Works for | Admin CYA | Actual education |

Style this as a visual comparison card, NOT a markdown table.

#### 5.6 For Teachers Section
Headline: `Teachers don't need more suspicion. They need more signal.`

Show a mock screenshot/preview of the Teacher Dashboard — just a styled div that looks like the dashboard, not a real screenshot.

Key message: "Aseel gives teachers a class-level view of where students are genuinely struggling — not who to punish."

#### 5.7 Ethics Section (Important for judges)
Headline: `Designed with privacy first.`

Three points:
- 🔒 **Zero data storage** — Nothing you paste is saved. Ever. Analysis is stateless.
- 🌍 **Bilingual** — Works in both Arabic and English. No language bias.
- ⚖️ **SDG 4 Aligned** — Supports UN Sustainable Development Goal 4: Quality Education.

#### 5.8 Footer
- Logo + tagline: "Building thinkers, not catching cheaters."
- Links: Student Mode | Teacher Dashboard | AI Declaration
- "Built for Safe AI Cup 2026 · UAE"
- Social: SafeAICup tag

---

## 6. PAGE: STUDENT MODE (`/student`)

This is the core feature. It must work perfectly and look impressive.

### Layout
Two-column on desktop (input left, results right). Single column on mobile.

### Left Panel: Input
**Header:**
- Title: "Paste Your Work"
- Subtitle: "Aseel will ask you questions — not judge you."

**Subject Selector:**
Dropdown with options: English | Arabic | Science | Math | History | Social Studies | Other
(Used to tailor Socratic questions to the subject)

**Language Toggle:**
Two buttons: "English" | "عربي" — affects the language of questions Aseel generates

**Text Area:**
- Placeholder: "Paste your essay, paragraph, or any written assignment here..."
- Min height: 300px, resizable
- Character counter bottom right
- Style: matches design system input style

**Analyze Button:**
- Gold, full width, large: "Analyze My Work →"
- Loading state: animated spinner + "Reading your thinking..." text
- Disabled when textarea is empty

**Privacy Note (below button):**
Small muted text: "🔒 Your work is never stored. Analysis happens in real-time and is immediately discarded."

### Right Panel: Results

**State 1 — Empty (before analysis)**
Centered illustration-style placeholder:
- Large outlined icon (book/lightbulb in gold)
- Text: "Your analysis will appear here"
- Subtext: "Paste your work and click Analyze to begin"

**State 2 — Loading**
Animated skeleton loaders in card shape, with subtle pulse animation.
Loading message cycling: "Reading your work..." → "Finding where to dig deeper..." → "Crafting your questions..."

**State 3 — Results**

Results come from the API and have this structure (see Section 8):
```typescript
{
  overallFeedback: string,       // 2-3 sentence overall assessment
  sections: [
    {
      id: string,
      excerpt: string,           // The specific text excerpt (max 100 chars)
      concern: "high" | "medium" | "low",
      reason: string,            // Why this section was flagged
      questions: string[],       // 2-3 Socratic questions (NOT rewrite tips)
      isExpanded: boolean        // UI state
    }
  ],
  integrityScore: number,        // 0-100, how much original thinking is present
  positives: string[],           // 2-3 things done well
  subjectTip: string             // One subject-specific tip
}
```

**Results UI components:**

A) **Integrity Score Card** (top of results)
- Large circular progress indicator showing the score (0-100)
- Color: green (80-100), yellow (50-79), red (0-49)
- Label: "Original Thinking Score"
- Subtext based on score:
  - 80-100: "Strong original voice. Answer the questions below to confirm."
  - 50-79: "Some sections need your own thinking. Let's explore them."
  - 0-49: "This work needs more of YOU in it. Start with these questions."
- IMPORTANT: Never say "AI-generated." Say "lacks original thinking" or "generic phrasing."

B) **What You Did Well** (green card)
- Heading: "✓ What's working"
- Bullet list of `positives` array

C) **Sections to Explore** (main section)
- Heading: "Questions to Prove This Is Yours"
- Subheading (muted): "These aren't accusations — they're your chance to show what you know."
- List of flagged sections, each as a collapsible card:

  Each section card contains:
  - Top bar: excerpt text in monospace + concern badge (High/Medium/Low in matching color)
  - Why Aseel is asking (the `reason` field, muted italic)
  - COLLAPSED by default. Click "See Questions →" to expand.
  - When expanded: numbered list of Socratic questions
  - Each question has a "I can answer this" checkbox (purely motivational, no data sent)
  - CRITICAL UI NOTE: Questions must NEVER say "rewrite this" or "here's how to hide AI use." They must ask the student to explain, justify, or elaborate on their own thinking.

D) **What To Do Next** (bottom card)
- If score >= 80: "Great foundation. Answer the questions above and your work is solid."
- If score < 80: "Try answering each question in 2-3 sentences, then rewrite those sections in your own words."
- Link to Declaration Generator: "Add an AI Use Declaration to your submission →"

**Sample Socratic Questions (reference for the AI prompt):**
Instead of: "Rewrite this paragraph without AI"
Use: "What personal experience or evidence makes you believe this claim?"
Use: "If a classmate challenged this point, what would you say?"
Use: "What did you find surprising when researching this topic?"
Use: "Explain this idea as if you were teaching it to a 10-year-old."
Use: "What would happen if the opposite were true?"

---

## 7. PAGE: TEACHER DASHBOARD (`/teacher`)

### Purpose
Show teachers class-level integrity trends. NOT individual student surveillance.

### Important: This page uses MOCK DATA
No real backend or database. The dashboard displays hardcoded/generated mock data that looks realistic. This is fine for the competition demo.

### Layout
Full-width dashboard layout. Sidebar navigation on desktop, tab navigation on mobile.

### Sidebar (desktop)
- Logo
- Nav items: Overview | Class Reports | Subject Breakdown | Resources
- User: "Ms. Al-Mansouri" (mock teacher name)

### Main Content Areas

#### 7.1 Overview Cards (4 stat cards in a row)
Mock data:
- **Students Analyzed This Week:** 47
- **Avg Integrity Score:** 71/100 (↑ 8 from last week)
- **Topics Needing Review:** 3
- **Most Improved:** Grade 11B

#### 7.2 Class Integrity Trend (Line Chart)
Use a simple SVG or CSS-based chart (no chart library needed for demo).
Show 4-week trend of average class integrity scores.
Mock data: Week 1: 58, Week 2: 64, Week 3: 69, Week 4: 71
Label: "Class Average Original Thinking Score — Last 4 Weeks"

#### 7.3 Subject Breakdown (Bar Chart)
Show integrity scores by subject.
Mock data:
- English: 74
- Science: 68
- History: 61
- Arabic: 82
- Math: 88

#### 7.4 Topics Where Students Struggled (Table)
3 columns: Topic | Class Avg Score | Suggested Action
Mock rows:
- "Industrial Revolution causes" | 54 | "Consider in-class discussion"
- "Climate change effects" | 61 | "Assign more primary sources"
- "Quadratic equations (word problems)" | 67 | "Peer explanation activity"

#### 7.5 Privacy Banner (important for judges)
Prominent card with lock icon:
> "Aseel never shows individual student scores to teachers. All data is anonymized and aggregated. Students are seen as a class, not as suspects."

#### 7.6 Resources Section
Three resource cards:
- "How to use Aseel in your classroom" (download PDF icon)
- "Guide to AI-assisted learning" (download)
- "UAE MoE AI Guidelines 2025-26" (external link)

---

## 8. PAGE: AI USE DECLARATION (`/declare`)

### Purpose
Help students create a proper, honest declaration of how they used AI in their assignment. Builds good habits. Shows judges Aseel promotes responsible AI use, not just detection.

### Layout
Centered, single column, max-width 700px.

### Form Fields
1. **Student Name** (text input)
2. **Assignment Title** (text input)
3. **Subject** (dropdown, same list as student page)
4. **How did you use AI?** (multi-select checkboxes):
   - ☐ I used AI to brainstorm ideas
   - ☐ I used AI to check grammar/spelling
   - ☐ I used AI to explain a concept I didn't understand
   - ☐ I used AI to suggest structure/outline
   - ☐ I used AI to translate text
   - ☐ I did NOT use AI in this assignment
5. **Describe your AI use in your own words** (textarea, optional)
6. **Generate Declaration** button (gold, full width)

### Output
After clicking, generates a formatted declaration block:

```
AI USE DECLARATION
──────────────────────────────────────
Student: [name]
Assignment: [title]
Subject: [subject]
Date: [auto-filled]

This student declares that AI tools were used in the following ways:
• [selected checkboxes as bullet points]

Additional context: [their description if provided]

This declaration was generated using Aseel — an AI Academic Integrity
Coach built for UAE schools. The student confirms this represents an
honest account of their AI use in this assignment.
──────────────────────────────────────
```

Display this in a styled card with:
- "Copy to Clipboard" button
- "Download as PDF" button (just triggers browser print to PDF)
- "Start Over" button

### Note on AI API for this page
This page does NOT call the Claude API. It generates the declaration purely from the form inputs. Keep it simple.

---

## 9. API ROUTES

### 9.1 POST `/api/analyze`

**Purpose:** Core analysis endpoint. Takes student work, returns structured analysis.

**Request body:**
```typescript
{
  text: string,       // Student's pasted work (max 5000 chars)
  subject: string,    // e.g., "English", "History"
  language: "en" | "ar"  // Language for questions
}
```

**Implementation:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const systemPrompt = `You are Aseel, an AI academic integrity coach for UAE students aged 11-18. 
Your job is NOT to catch cheaters. Your job is to help students prove they genuinely understand their own work by asking Socratic questions.

CRITICAL RULES:
1. NEVER tell a student to "rewrite" anything or "hide AI use"
2. NEVER use the word "AI-generated" in your feedback
3. ALWAYS frame flags as opportunities to demonstrate understanding, not as accusations
4. Questions must require the student to draw on genuine personal knowledge, reasoning, or experience
5. Be encouraging and educational in tone — like a supportive teacher, not a detective
6. Consider that students may be ESL or writing in a second language — flag thinking quality, not language quality

SCORING:
- integrityScore measures "original thinking" NOT "AI use"
- A well-written essay with personal examples and clear reasoning = high score
- Generic claims, passive voice without justification, unsupported assertions = lower score
- Good grammar and structure alone should NOT lower the score

SOCRATIC QUESTION EXAMPLES (use this style):
✅ "What specific event or moment made you form this opinion?"
✅ "If someone argued the opposite, what would you say to them?"
✅ "What did you find most surprising about this topic?"
✅ "Explain this idea as if teaching it to a younger student."
✅ "What personal connection do you have to this topic?"
❌ "Rewrite this in your own words"
❌ "This appears AI-generated, please revise"`;

const userPrompt = `Analyze this ${subject} assignment written by a UAE student:

---
${text}
---

Respond ONLY with valid JSON matching this exact structure:
{
  "overallFeedback": "2-3 sentence encouraging assessment of the work's original thinking",
  "integrityScore": <number 0-100>,
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
  "subjectTip": "One specific tip relevant to ${subject} assignments"
}

Return 2-4 sections maximum. If the work scores above 85, return 1-2 sections. 
If language is "ar", write all questions, feedback, and tips in Arabic.
Return ONLY the JSON object, no other text.`;
```

**Response:** Return the parsed JSON directly to the client.

**Error handling:**
- Text too short (< 50 chars): return 400 with `{ error: "Please paste at least a paragraph of your work." }`
- Text too long (> 5000 chars): truncate to 5000 chars before sending
- API error: return 500 with `{ error: "Analysis failed. Please try again." }`

**Rate limiting:** None needed for competition demo. Add a note in code comments.

---

## 10. COMPONENT LIBRARY

Build these reusable components:

### `<Navbar />`
Props: none. Uses `usePathname()` to highlight active link.

### `<IntegrityScoreRing score={number} />`
SVG-based circular progress ring. Animates from 0 to score on mount using CSS animation.
Colors: green ≥80, yellow ≥50, red <50.

### `<SectionCard section={Section} />`
Collapsible card for each flagged section. Contains excerpt, concern badge, reason, questions.
Smooth expand/collapse animation.

### `<ConcernBadge level="high"|"medium"|"low" />`
Pill badge. High=red, Medium=yellow/amber, Low=teal.
Text: "Look Deeper" (high) | "Explore" (medium) | "Minor" (low)
Never use words like "suspicious" or "detected."

### `<LoadingSkeleton />`
Animated skeleton placeholder matching the results panel layout.

### `<PrivacyBanner />`
Reusable banner with lock icon and privacy message. Used on student page and teacher dashboard.

---

## 11. IMPORTANT UX DETAILS

1. **Mobile responsive** — Must look good on phones. Teachers and students will use this on mobile.

2. **No login required** — Zero friction. Open the page, paste, analyze. Done.

3. **Smooth animations** — Use Framer Motion for:
   - Results panel sliding in from right
   - Score ring counting up
   - Section cards expanding/collapsing
   - Page transitions

4. **Bilingual UI hint** — The language toggle on the student page affects question language only. The UI itself stays in English. (Full Arabic UI would take too long for 7 days.)

5. **The word "cheat" never appears in the UI** — Not once. Not even in error messages. This is intentional and part of the design philosophy. Use: "integrity", "original thinking", "your voice", "understanding."

6. **Loading messages** — The analysis takes 3-8 seconds. Cycle through these messages while loading:
   - "Reading your work..."
   - "Finding where to dig deeper..."
   - "Crafting questions just for you..."
   - "Almost ready..."

7. **Demo mode** — Add a small "Try Demo" button on the student page that fills the textarea with a sample essay and runs analysis. This is critical for the video demo. Use this sample text:
```
The Industrial Revolution was a very important period in history. It changed many things 
about how people lived and worked. Many factories were built and people moved from the 
countryside to cities. This caused both positive and negative effects on society. 
The positive effects included more jobs and economic growth. The negative effects included 
pollution and poor working conditions. Overall, the Industrial Revolution had a significant 
impact on the modern world and shaped the economy we have today.
```

---

## 12. FILE STRUCTURE

```
aseel/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing page
│   ├── globals.css             # CSS variables, base styles
│   ├── student/
│   │   └── page.tsx            # Student analysis page
│   ├── teacher/
│   │   └── page.tsx            # Teacher dashboard
│   ├── declare/
│   │   └── page.tsx            # AI use declaration
│   └── api/
│       └── analyze/
│           └── route.ts        # Claude API endpoint
├── components/
│   ├── Navbar.tsx
│   ├── IntegrityScoreRing.tsx
│   ├── SectionCard.tsx
│   ├── ConcernBadge.tsx
│   ├── LoadingSkeleton.tsx
│   └── PrivacyBanner.tsx
├── lib/
│   └── types.ts                # TypeScript interfaces
├── public/
│   └── (any static assets)
├── .env.local                  # ANTHROPIC_API_KEY (never commit)
├── .env.example                # ANTHROPIC_API_KEY=your_key_here
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 13. TYPESCRIPT TYPES (`lib/types.ts`)

```typescript
export interface AnalysisSection {
  id: string;
  excerpt: string;
  concern: 'high' | 'medium' | 'low';
  reason: string;
  questions: string[];
}

export interface AnalysisResult {
  overallFeedback: string;
  integrityScore: number;
  positives: string[];
  sections: AnalysisSection[];
  subjectTip: string;
}

export interface AnalyzeRequest {
  text: string;
  subject: string;
  language: 'en' | 'ar';
}
```

---

## 14. METADATA & SEO (`layout.tsx`)

```typescript
export const metadata = {
  title: 'Aseel | AI Academic Integrity Coach',
  description: 'Aseel helps UAE students develop genuine academic integrity through Socratic questioning. Built for Safe AI Cup 2026.',
  keywords: 'academic integrity, UAE education, AI tools, student learning, Safe AI Cup',
}
```

---

## 15. COMPETITION-SPECIFIC NOTES

### For the 3-minute video demo
1. Open landing page — show the hero briefly (10 seconds)
2. Navigate to Student Mode
3. Click "Try Demo" to fill in the sample essay
4. Click Analyze — show the loading state
5. Walk through the results: score ring, positives, then one flagged section
6. Expand the section — read out one Socratic question
7. Navigate to Teacher Dashboard — show the mock data (15 seconds)
8. Navigate to Declaration page — fill and generate (20 seconds)
9. Cut back to landing — close on the tagline

### For the Technical One-Pager
Key points to include:
- Architecture: Next.js SSR + serverless API routes + Anthropic Claude API
- Ethics: Stateless by design, no PII stored, bilingual, SDG 4 aligned
- Scalability: Can be deployed to any UAE school with a URL — no installation
- Innovation: First Socratic-method integrity tool vs. detection-based competitors
- Evidence: UAE faculty research showing 75% educators prefer educative over punitive approaches

### For the Live Q&A (May 20)
Prepare answers for:
- "Won't this help cheaters bypass detection?" → "We don't tell them how to rewrite. We ask them to prove they understand. You can't fake that."
- "How is this different from ChatGPT?" → "ChatGPT generates content. Aseel interrogates whether you understand yours."
- "How would a school adopt this?" → "Zero setup. Share the link. Works on any device. No login needed."
- "What about data privacy?" → "Nothing is stored. Ever. Our architecture is stateless by design."

---

## 16. WHAT NOT TO BUILD (scope limits for 7 days)

- ❌ User authentication / accounts
- ❌ Database / persistent storage
- ❌ Paid tier / subscription
- ❌ Full Arabic UI (language toggle for questions is enough)
- ❌ Chrome extension
- ❌ LMS integration (Google Classroom etc.)
- ❌ Real teacher accounts with real student data

All of the above can be mentioned as "future roadmap" in the pitch — they actually HELP your scalability score.

---

*PRD prepared for Safe AI Cup 2026 — Teens Category*
*Build with: Next.js 14 · Tailwind CSS · Anthropic Claude API · Vercel*
