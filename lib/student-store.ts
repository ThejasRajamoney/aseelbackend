import { randomUUID } from 'node:crypto';
import { getDb, persistDb, queryAll, runStatement } from '@/lib/db';
import type {
  AnalyzeRequest,
  AnalysisResult,
  TeacherDashboardData,
  TeacherRecentSubmission,
  TeacherStudentRow,
  TeacherOverviewCard,
  TeacherTopicRow,
} from '@/lib/types';
import { teacherSubjectBreakdown } from '@/lib/site-data';

type AnalysisRow = {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  language: string;
  text: string;
  integrity_score: number;
  overall_feedback: string;
  positives_json: string;
  sections_json: string;
  subject_tip: string;
  analysis_json: string;
  created_at: string;
};

type TeacherStudentDbRow = {
  id: string;
  teacher_id: string;
  student_name: string;
  student_email: string;
  status: 'invited' | 'active';
  student_user_id: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
};

const weekMs = 7 * 24 * 60 * 60 * 1000;

const emptyTrend = [0, 0, 0, 0] as const;

const emptyOverviewCards: TeacherOverviewCard[] = [
  { label: 'Students Analyzed This Week', value: '0' },
  { label: 'Avg Integrity Score', value: '0/100', meta: 'No submissions yet' },
  { label: 'Topics Needing Review', value: '0' },
  { label: 'Most Improved', value: 'Waiting for first submission' },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function displayNameFromEmail(email: string) {
  const localPart = normalizeEmail(email).split('@')[0] || 'Student';
  return localPart.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Student';
}

function toIso(date = new Date()) {
  return date.toISOString();
}

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function formatScore(value: number) {
  return `${Math.round(value)}/100`;
}

function buildEmptyTeacherDashboardData(students: TeacherStudentRow[] = []): TeacherDashboardData {
  return {
    overviewCards: emptyOverviewCards.map((card) => ({ ...card })),
    trend: [...emptyTrend],
    trendLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    subjectBreakdown: teacherSubjectBreakdown.map((item) => ({ label: item.label, value: 0 })),
    topics: [],
    students,
    recentSubmissions: [],
  };
}

function mapStudentRow(row: TeacherStudentDbRow): TeacherStudentRow {
  return {
    id: row.id,
    name: row.student_name,
    email: row.student_email,
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

function computeWeeklyAverage(rows: AnalysisRow[]) {
  const now = Date.now();

  return [0, 1, 2, 3].map((index) => {
    const start = now - (3 - index + 1) * weekMs;
    const end = now - (3 - index) * weekMs;
    const bucketRows = rows.filter((row) => {
      const time = new Date(row.created_at).getTime();
      return time >= start && time < end;
    });

    return bucketRows.length
      ? Math.round(bucketRows.reduce((sum, row) => sum + row.integrity_score, 0) / bucketRows.length)
      : 0;
  });
}

function computeSubjectBreakdown(rows: AnalysisRow[]) {
  const grouped = new Map<string, { total: number; count: number }>();

  rows.forEach((row) => {
    const entry = grouped.get(row.subject) ?? { total: 0, count: 0 };
    entry.total += row.integrity_score;
    entry.count += 1;
    grouped.set(row.subject, entry);
  });

  return Array.from(grouped.entries())
    .map(([label, stats]) => ({
      label,
      value: Math.round(stats.total / stats.count),
    }))
    .sort((a, b) => b.value - a.value);
}

function describeAction(subject: string, score: number) {
  if (score < 55) {
    return `Plan a guided ${subject.toLowerCase()} discussion`;
  }

  if (score < 70) {
    return 'Assign a short peer explanation activity';
  }

  return `Ask for a stronger example in ${subject.toLowerCase()}`;
}

function extractTopic(row: AnalysisRow) {
  const sections = parseJsonArray<{ excerpt?: string }>(row.sections_json, []);
  const excerpt = sections[0]?.excerpt?.trim();

  if (excerpt) {
    return excerpt.length > 60 ? `${excerpt.slice(0, 57).trim()}...` : excerpt;
  }

  return `${row.subject} response`;
}

function buildOverviewCards(rows: AnalysisRow[]) {
  const now = Date.now();
  const weekAgo = now - weekMs;
  const previousWeekAgo = now - 2 * weekMs;

  const thisWeekRows = rows.filter((row) => new Date(row.created_at).getTime() >= weekAgo);
  const previousWeekRows = rows.filter((row) => {
    const time = new Date(row.created_at).getTime();
    return time >= previousWeekAgo && time < weekAgo;
  });

  const distinctStudents = new Set(thisWeekRows.map((row) => row.student_id)).size;
  const currentAverage = thisWeekRows.length
    ? Math.round(thisWeekRows.reduce((sum, row) => sum + row.integrity_score, 0) / thisWeekRows.length)
    : 0;
  const previousAverage = previousWeekRows.length
    ? Math.round(previousWeekRows.reduce((sum, row) => sum + row.integrity_score, 0) / previousWeekRows.length)
    : 0;
  const delta = currentAverage - previousAverage;

  const lowTopicCount = new Set(
    rows
      .filter((row) => row.integrity_score < 70)
      .map((row) => row.subject),
  ).size;

  const improvementCandidates = new Map<string, { studentName: string; latest: number; previous?: number }>();
  rows
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach((row) => {
      const entry = improvementCandidates.get(row.student_id);
      if (!entry) {
        improvementCandidates.set(row.student_id, { studentName: row.student_name, latest: row.integrity_score });
        return;
      }

      entry.previous = entry.latest;
      entry.latest = row.integrity_score;
      entry.studentName = row.student_name;
    });

  const mostImproved = Array.from(improvementCandidates.values())
    .filter((entry) => typeof entry.previous === 'number')
    .map((entry) => ({
      studentName: entry.studentName,
      delta: (entry.latest ?? 0) - (entry.previous ?? 0),
    }))
    .filter((entry) => entry.delta > 0)
    .sort((a, b) => b.delta - a.delta)[0];

  return [
    { label: 'Students Analyzed This Week', value: String(distinctStudents) },
    {
      label: 'Avg Integrity Score',
      value: formatScore(currentAverage),
      meta: previousWeekRows.length ? `${delta >= 0 ? '↑' : '↓'} ${Math.abs(delta)} from last week` : 'No prior week yet',
    },
    { label: 'Topics Needing Review', value: String(lowTopicCount || 0) },
    {
      label: 'Most Improved',
      value: mostImproved ? `${mostImproved.studentName} (+${mostImproved.delta})` : 'Waiting for more data',
    },
  ];
}

function buildRecentSubmissions(rows: AnalysisRow[]): TeacherRecentSubmission[] {
  return rows
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((row) => ({
      id: row.id,
      studentName: row.student_name,
      subject: row.subject,
      score: row.integrity_score,
      createdAt: row.created_at,
      excerpt: extractTopic(row),
    }));
}

function getTeacherAnalysisRows(teacherId: string) {
  const db = getDb();

  return queryAll<AnalysisRow>(
    db,
    `SELECT analyses.id, analyses.student_id, analyses.student_name, analyses.subject, analyses.language, analyses.text,
            analyses.integrity_score, analyses.overall_feedback, analyses.positives_json, analyses.sections_json,
            analyses.subject_tip, analyses.analysis_json, analyses.created_at
       FROM analyses
       INNER JOIN teacher_students ON teacher_students.student_user_id = analyses.student_id
      WHERE teacher_students.teacher_id = ?
      ORDER BY datetime(analyses.created_at) DESC`,
    [teacherId],
  );
}

export function getTeacherStudents(teacherId: string): TeacherStudentRow[] {
  const db = getDb();
  const rows = queryAll<TeacherStudentDbRow>(
    db,
    `SELECT id, teacher_id, student_name, student_email, status, student_user_id, created_at, updated_at, accepted_at
       FROM teacher_students
      WHERE teacher_id = ?
      ORDER BY datetime(created_at) DESC`,
    [teacherId],
  );

  return rows.map(mapStudentRow);
}

export function getTeacherStudentById(teacherId: string, studentId: string) {
  const db = getDb();
  const row = queryAll<TeacherStudentDbRow>(
    db,
    `SELECT id, teacher_id, student_name, student_email, status, student_user_id, created_at, updated_at, accepted_at
       FROM teacher_students
      WHERE teacher_id = ? AND id = ?
      LIMIT 1`,
    [teacherId, studentId],
  )[0];

  return row ? mapStudentRow(row) : null;
}

export function saveTeacherStudentInvite(teacherId: string, input: { studentName?: string; studentEmail: string }) {
  const db = getDb();
  const studentEmail = normalizeEmail(input.studentEmail);

  if (!isValidEmail(studentEmail)) {
    throw new Error('Enter a valid student email address.');
  }

  const studentName = (input.studentName?.trim() || displayNameFromEmail(studentEmail)).slice(0, 80);
  const now = toIso();
  const existingUser = queryAll<{ id: string; role: string }>(
    db,
    `SELECT id, role FROM auth_users WHERE email = ? LIMIT 1`,
    [studentEmail],
  )[0];
  const isActive = existingUser?.role === 'student';
  const studentUserId = isActive ? existingUser.id : null;

  runStatement(
    db,
    `INSERT INTO teacher_students (
       id, teacher_id, student_name, student_email, status, student_user_id, created_at, updated_at, accepted_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(teacher_id, student_email) DO UPDATE SET
       student_name = excluded.student_name,
       status = CASE WHEN excluded.student_user_id IS NOT NULL THEN 'active' ELSE teacher_students.status END,
       student_user_id = COALESCE(excluded.student_user_id, teacher_students.student_user_id),
       updated_at = excluded.updated_at,
       accepted_at = CASE
         WHEN excluded.student_user_id IS NOT NULL THEN COALESCE(teacher_students.accepted_at, excluded.accepted_at)
         ELSE teacher_students.accepted_at
       END`,
    [
      randomUUID(),
      teacherId,
      studentName,
      studentEmail,
      isActive ? 'active' : 'invited',
      studentUserId,
      now,
      now,
      isActive ? now : null,
    ],
  );

  const saved = queryAll<TeacherStudentDbRow>(
    db,
    `SELECT id, teacher_id, student_name, student_email, status, student_user_id, created_at, updated_at, accepted_at
       FROM teacher_students
      WHERE teacher_id = ? AND student_email = ?
      LIMIT 1`,
    [teacherId, studentEmail],
  )[0];

  return mapStudentRow(
    saved ?? {
      id: randomUUID(),
      teacher_id: teacherId,
      student_name: studentName,
      student_email: studentEmail,
      status: isActive ? 'active' : 'invited',
      student_user_id: studentUserId,
      created_at: now,
      updated_at: now,
      accepted_at: isActive ? now : null,
    },
  );
}

export function linkTeacherStudentsToEmail(studentEmail: string, studentUserId: string, studentName: string) {
  const db = getDb();
  const normalizedEmail = normalizeEmail(studentEmail);
  const now = toIso();

  runStatement(
    db,
    `UPDATE teacher_students
        SET status = 'active',
            student_name = ?,
            student_user_id = ?,
            accepted_at = COALESCE(accepted_at, ?),
            updated_at = ?
      WHERE lower(student_email) = lower(?)`,
    [studentName, studentUserId, now, now, normalizedEmail],
  );
}

function buildTopics(rows: AnalysisRow[]) {
  const lowRows = rows
    .filter((row) => row.integrity_score < 75)
    .slice()
    .sort((a, b) => a.integrity_score - b.integrity_score)
    .slice(0, 3);

  return lowRows.map((row) => ({
    topic: extractTopic(row),
    score: row.integrity_score,
    action: describeAction(row.subject, row.integrity_score),
  }));
}

export async function saveAnalysisSubmission(input: AnalyzeRequest, result: AnalysisResult) {
  const db = getDb();
  const studentId = input.studentId?.trim() || randomUUID();
  const studentName = input.studentName?.trim() || 'Anonymous Student';
  const now = toIso();
  const payload = JSON.stringify(result);

  runStatement(
    db,
    `INSERT INTO students (id, name, created_at, updated_at, submission_count)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       updated_at = excluded.updated_at,
       submission_count = students.submission_count + 1`,
    [studentId, studentName, now, now],
  );

  runStatement(
    db,
    `INSERT INTO analyses (
      id, student_id, student_name, subject, language, text,
      integrity_score, overall_feedback, positives_json, sections_json,
      subject_tip, analysis_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      studentId,
      studentName,
      input.subject,
      input.language,
      input.text,
      result.integrityScore,
      result.overallFeedback,
      JSON.stringify(result.positives),
      JSON.stringify(result.sections),
      result.subjectTip,
      payload,
      now,
    ],
  );

  persistDb();

  return { studentId, studentName };
}

export async function getTeacherDashboardData(teacherId: string): Promise<TeacherDashboardData> {
  const rows = getTeacherAnalysisRows(teacherId);
  const students = getTeacherStudents(teacherId);

  if (rows.length === 0) {
    return buildEmptyTeacherDashboardData(students);
  }

  const trend = computeWeeklyAverage(rows).slice(-4);

  return {
    overviewCards: buildOverviewCards(rows),
    trend: trend.length === 4 ? trend : [...emptyTrend],
    trendLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    subjectBreakdown: computeSubjectBreakdown(rows).slice(0, 5),
    topics: buildTopics(rows) as TeacherTopicRow[],
    students,
    recentSubmissions: rows.length > 0 ? buildRecentSubmissions(rows) : [],
  };
}
