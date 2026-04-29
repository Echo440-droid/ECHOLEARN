// ─── EchoLearn API Client ───────────────────────
// Typed fetch wrappers for the REST API.

const API_BASE = 'https://p01--echolearn--5fdqsgfwm5w8.code.run/api';

// ─── Types ──────────────────────────────────────

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  tone: string;
  thoughtProfile: string;
  warmth: number;
  voiceId: string | null;
  commStyle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  name: string;
  subject: string;
  sourceUrl: string | null;
  fullText: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  topicId: string;
  conversationHistory: unknown[];
  progressPercent: number;
  lastAccessedAt: string;
  createdAt: string;
  topic: Topic;
}

// ─── Helpers ────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── User ───────────────────────────────────────

export function createUser(data: { name?: string; email?: string } = {}): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getUser(userId: string): Promise<User> {
  return apiFetch<User>(`/users/${userId}`);
}

export function updatePreferences(
  userId: string,
  data: {
    tone?: string;
    thoughtProfile?: string;
    warmth?: number;
    voiceId?: string;
    commStyle?: string;
    name?: string;
  }
): Promise<User> {
  return apiFetch<User>(`/users/${userId}/preferences`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Topics & Sessions ──────────────────────────

export function getUserTopics(userId: string): Promise<Topic[]> {
  return apiFetch<Topic[]>(`/users/${userId}/topics`);
}

export function getUserSessions(userId: string): Promise<Session[]> {
  return apiFetch<Session[]>(`/users/${userId}/sessions`);
}

// ─── Voice Clone ────────────────────────────────

export function uploadVoice(
  userId: string,
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<{ voiceId: string | null }> {
  return apiFetch<{ voiceId: string | null }>(`/users/${userId}/voice-clone`, {
    method: 'POST',
    body: JSON.stringify({ audioBase64, mimeType }),
  });
}

// ─── Auth ───────────────────────────────────────

export function signUp(data: { email: string; password: string; name?: string }): Promise<User> {
  return apiFetch<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function signIn(data: { email: string; password: string }): Promise<User> {
  return apiFetch<User>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
