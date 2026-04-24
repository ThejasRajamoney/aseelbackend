import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const dbPath =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    ? resolve('/tmp', 'aseel.sqlite')
    : resolve(process.cwd(), 'data', 'aseel.sqlite');

const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    submission_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    language TEXT NOT NULL,
    text TEXT NOT NULL,
    integrity_score INTEGER NOT NULL,
    overall_feedback TEXT NOT NULL,
    positives_json TEXT NOT NULL,
    sections_json TEXT NOT NULL,
    subject_tip TEXT NOT NULL,
    analysis_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
  CREATE INDEX IF NOT EXISTS idx_analyses_student_id ON analyses(student_id);
  CREATE INDEX IF NOT EXISTS idx_analyses_subject ON analyses(subject);

  CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS teacher_students (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('invited', 'active')) DEFAULT 'invited',
    student_user_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    accepted_at TEXT,
    FOREIGN KEY (teacher_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES auth_users(id) ON DELETE SET NULL,
    UNIQUE (teacher_id, student_email)
  );

  CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
  CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students(teacher_id);
  CREATE INDEX IF NOT EXISTS idx_teacher_students_email ON teacher_students(student_email);
  CREATE INDEX IF NOT EXISTS idx_teacher_students_status ON teacher_students(status);
`;

function createDatabase() {
  mkdirSync(dirname(dbPath), { recursive: true });

  const database = new DatabaseSync(dbPath);
  database.exec(schema);
  return database;
}

const globalForDb = globalThis as typeof globalThis & {
  __aseelDb?: DatabaseSync;
};

export function getDb() {
  if (!globalForDb.__aseelDb) {
    globalForDb.__aseelDb = createDatabase();
  }

  return globalForDb.__aseelDb;
}

export function runStatement(dbInstance: DatabaseSync, sql: string, params: Array<string | number | null> = []) {
  dbInstance.prepare(sql).run(...params);
}

export function queryAll<T extends Record<string, unknown>>(
  dbInstance: DatabaseSync,
  sql: string,
  params: Array<string | number | null> = [],
) {
  return dbInstance.prepare(sql).all(...params) as T[];
}

export function queryOne<T extends Record<string, unknown>>(
  dbInstance: DatabaseSync,
  sql: string,
  params: Array<string | number | null> = [],
) {
  return dbInstance.prepare(sql).get(...params) as T | undefined;
}

export function persistDb() {
  return undefined;
}
