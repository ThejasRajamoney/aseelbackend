export type AnalysisLanguage = 'en' | 'ar';

export type AuthRole = 'student' | 'teacher';

export type ConcernLevel = 'high' | 'medium' | 'low';

export interface AnalysisSection {
  id: string;
  excerpt: string;
  concern: ConcernLevel;
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
  language: AnalysisLanguage;
  studentId?: string;
  studentName?: string;
}

export interface AnswerReviewRequest {
  question: string;
  answer: string;
  excerpt: string;
  subject: string;
  language: AnalysisLanguage;
}

export interface AnswerReviewResult {
  summary: string;
  improvement: string;
  isPerfect: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export interface AuthSessionResponse {
  user: AuthUser | null;
}

export interface TeacherOverviewCard {
  label: string;
  value: string;
  meta?: string;
}

export interface TeacherTopicRow {
  topic: string;
  score: number;
  action: string;
}

export interface TeacherStudentRow {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'active';
  createdAt: string;
  acceptedAt?: string | null;
}

export interface StudentInviteEmailResult {
  id?: string;
  recipientEmail: string;
  deliveryMode: 'test' | 'live';
}

export interface TeacherResource {
  slug: string;
  eyebrow: string;
  title: string;
  detail: string;
  action: string;
  href: string;
  external?: boolean;
}

export interface TeacherRecentSubmission {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  createdAt: string;
  excerpt: string;
}

export interface TeacherDashboardData {
  overviewCards: TeacherOverviewCard[];
  trend: number[];
  trendLabels: string[];
  subjectBreakdown: Array<{ label: string; value: number }>;
  topics: TeacherTopicRow[];
  students: TeacherStudentRow[];
  recentSubmissions: TeacherRecentSubmission[];
}
