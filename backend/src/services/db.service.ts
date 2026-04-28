// ─── Database Service ───────────────────────────
// All Prisma queries for User, Topic, and Session.

import { prisma } from '../lib/prisma';
import type { User, Topic, Session, Prisma } from '@prisma/client';
import type { ConversationMessage } from './ai.service';

// ─── User ───────────────────────────────────────

export async function getUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User not found: ${userId}`);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateUserPreferences(
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
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function createUser(data: {
  name?: string;
  email?: string;
  password?: string;
  tone?: string;
  thoughtProfile?: string;
  warmth?: number;
  voiceId?: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

// ─── Topic ──────────────────────────────────────

export async function getTopic(topicId: string): Promise<Topic> {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error(`Topic not found: ${topicId}`);
  return topic;
}

export async function createTopic(data: {
  userId: string;
  name: string;
  subject?: string;
  sourceUrl?: string;
  fullText?: string;
}): Promise<Topic> {
  return prisma.topic.create({
    data: {
      userId: data.userId,
      name: data.name,
      subject: data.subject || 'General',
      sourceUrl: data.sourceUrl,
      fullText: data.fullText,
    },
  });
}

export async function getUserTopics(userId: string): Promise<Topic[]> {
  return prisma.topic.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Session ────────────────────────────────────

export type SessionWithTopic = Session & { topic: Topic };

export async function getSession(sessionId: string): Promise<SessionWithTopic> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { topic: true },
  });
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  return session;
}

export async function createSession(userId: string, topicId: string): Promise<Session> {
  return prisma.session.create({
    data: {
      userId,
      topicId,
      conversationHistory: [],
      progressPercent: 0,
    },
  });
}

export async function saveSession(
  sessionId: string,
  conversationHistory: ConversationMessage[],
  progressPercent?: number | null
): Promise<void> {
  const data: Prisma.SessionUpdateInput = {
    conversationHistory: conversationHistory as unknown as Prisma.InputJsonValue,
    lastAccessedAt: new Date(),
  };

  if (progressPercent !== null && progressPercent !== undefined) {
    data.progressPercent = progressPercent;
  }

  await prisma.session.update({
    where: { id: sessionId },
    data,
  });
}

export async function getUserSessions(userId: string): Promise<SessionWithTopic[]> {
  return prisma.session.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { lastAccessedAt: 'desc' },
  });
}
