// ─── Init Handler ───────────────────────────────
// Handles the 'init' message: loads user, resumes or creates a session.

import WebSocket from 'ws';
import * as db from '../../services/db.service';
import {
  buildSystemPrompt,
  buildTopicContext,
  summarizeHistory,
  runTutorPipeline,
  type ConversationMessage,
  type UserProfile,
} from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

export async function handleInit(
  msg: { userId: string; sessionId?: string; topicId?: string; topicName?: string },
  ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  sendError: (message: string) => void
): Promise<void> {
  try {
    const dbUser = await db.getUser(msg.userId);
    state.user = {
      id: dbUser.id,
      name: dbUser.name,
      tone: dbUser.tone,
      thoughtProfile: dbUser.thoughtProfile,
      warmth: dbUser.warmth,
      voiceId: dbUser.voiceId,
    };

    if (msg.sessionId) {
      // Resume existing session
      const session = await db.getSession(msg.sessionId);
      state.sessionId = session.id;
      state.topic = session.topic;
      state.conversationHistory = (session.conversationHistory as unknown as ConversationMessage[]) || [];

      // If history is too long, summarize it
      if (state.conversationHistory.length > 40) {
        const summary = await summarizeHistory(state.conversationHistory);
        state.conversationHistory = [
          { role: 'user', content: 'Previously covered:' },
          { role: 'assistant', content: summary },
        ];
        await db.saveSession(state.sessionId, state.conversationHistory);
      }

      send({ type: 'init_ok', sessionId: state.sessionId, resuming: true, topicName: session.topic.name });

      // Greet the user on resume
      const systemPrompt = buildSystemPrompt(state.user, buildTopicContext(session.topic.fullText));
      const greetMessages: ConversationMessage[] = [
        ...state.conversationHistory,
        {
          role: 'user',
          content:
            'I am back. Give me a brief friendly welcome back and remind me where we left off in one or two sentences.',
        },
      ];

      const greeting = await runTutorPipeline({
        user: state.user,
        systemPrompt,
        messages: greetMessages,
        ws,
      });
      state.conversationHistory.push({ role: 'user', content: 'Welcome back message' });
      state.conversationHistory.push({ role: 'assistant', content: greeting });
      await db.saveSession(state.sessionId, state.conversationHistory);
    } else if (msg.topicId) {
      // New session for an existing topic
      const topic = await db.getTopic(msg.topicId);
      state.topic = topic;

      const newSession = await db.createSession(state.user.id, msg.topicId);
      state.sessionId = newSession.id;
      state.conversationHistory = [];

      send({ type: 'init_ok', sessionId: state.sessionId, resuming: false, topicName: topic.name });
    } else {
      // Just initialize user state for an upcoming action (like upload_pdf)
      send({ type: 'init_ok', sessionId: null, resuming: false, topicName: null });
    }
  } catch (err: any) {
    sendError(`Init failed: ${err.message}`);
  }
}
