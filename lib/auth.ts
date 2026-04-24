import 'server-only';

import { randomBytes, randomUUID, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { getDb, queryOne, runStatement } from '@/lib/db';
import { linkTeacherStudentsToEmail } from '@/lib/student-store';
import type { AuthRole, AuthUser } from '@/lib/types';

export const AUTH_SESSION_COOKIE = 'aseel-session';

const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const passwordIterations = 120000;
const passwordKeyLength = 32;
const passwordDigest = 'sha256';

type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  password_salt: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

type AuthSessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'student' || value === 'teacher';
}

function toPublicUser(row: Pick<AuthUserRow, 'id' | 'name' | 'email' | 'role'>): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, passwordIterations, passwordKeyLength, passwordDigest).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = hashPassword(password, salt).hash;
  const actualBuffer = Buffer.from(actualHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function getUserByEmail(email: string) {
  return queryOne<AuthUserRow>(
    getDb(),
    `SELECT id, name, email, role, password_salt, password_hash, created_at, updated_at
     FROM auth_users
     WHERE email = ?`,
    [normalizeEmail(email)],
  );
}

function getUserById(id: string) {
  return queryOne<AuthUserRow>(
    getDb(),
    `SELECT id, name, email, role, password_salt, password_hash, created_at, updated_at
     FROM auth_users
     WHERE id = ?`,
    [id],
  );
}

function getSessionById(sessionId: string) {
  return queryOne<AuthSessionRow>(
    getDb(),
    `SELECT id, user_id, created_at, expires_at
     FROM auth_sessions
     WHERE id = ?`,
    [sessionId],
  );
}

export function createAuthUser(input: { name: string; email: string; password: string; role: unknown }) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (!name) {
    throw new Error('Name is required.');
  }

  if (!isValidEmail(email)) {
    throw new Error('Enter a valid email address.');
  }

  if (input.password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  if (!isAuthRole(input.role)) {
    throw new Error('Choose a valid account role.');
  }

  if (getUserByEmail(email)) {
    throw new Error('An account with this email already exists.');
  }

  const now = new Date().toISOString();
  const userId = randomUUID();
  const { salt, hash } = hashPassword(input.password);

  runStatement(
    getDb(),
    `INSERT INTO auth_users (id, name, email, role, password_salt, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, input.role, salt, hash, now, now],
  );

  if (input.role === 'student') {
    linkTeacherStudentsToEmail(email, userId, name);
  }

  return toPublicUser({ id: userId, name, email, role: input.role });
}

export function authenticateAuthUser(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const user = getUserByEmail(email);

  if (!user || !verifyPassword(input.password, user.password_salt, user.password_hash)) {
    return null;
  }

  return toPublicUser(user);
}

export function createAuthSession(userId: string) {
  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionTtlMs).toISOString();

  runStatement(
    getDb(),
    `INSERT INTO auth_sessions (id, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`,
    [sessionId, userId, now.toISOString(), expiresAt],
  );

  return { sessionId, expiresAt };
}

export function deleteAuthSession(sessionId: string) {
  runStatement(getDb(), 'DELETE FROM auth_sessions WHERE id = ?', [sessionId]);
}

export function getAuthUserFromSession(sessionId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const session = getSessionById(sessionId);

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    deleteAuthSession(session.id);
    return null;
  }

  const user = getUserById(session.user_id);

  if (!user) {
    deleteAuthSession(session.id);
    return null;
  }

  return toPublicUser(user);
}

export function getCurrentAuthUser() {
  const sessionId = cookies().get(AUTH_SESSION_COOKIE)?.value;
  return getAuthUserFromSession(sessionId);
}

export function setAuthCookie(response: NextResponse, sessionId: string) {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionTtlMs / 1000,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}
