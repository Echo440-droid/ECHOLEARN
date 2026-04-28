// ─── Text Handler ───────────────────────────────
// Handles the 'text_question' message: text fallback if user types instead of speaking.

import WebSocket from 'ws';
import * as db from '../../services/db.service';
import {
  buildSystemPrompt,
  buildTopicContext,
  runTutorPipeline,
} from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

export async function handleTextQuestion(
  msg: { text: string },
  ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  sendError: (message: string) => void
): Promise<void> {
  if (!state.user || !state.sessionId) return sendError('Not initialized');

  try {
    send({ type: 'status', status: 'thinking' });

    const topicContext = buildTopicContext(state.topic?.fullText);
    const systemPrompt = buildSystemPrompt(state.user, topicContext);
    const messages = [
      ...state.conversationHistory,
      { role: 'user' as const, content: msg.text },
    ];

    const response = await (() => {
      const abort = new AbortController();
      state.pipelineAbort = abort;
      return runTutorPipeline({ user: state.user, systemPrompt, messages, ws, signal: abort.signal })
        .finally(() => { if (state.pipelineAbort === abort) state.pipelineAbort = null; });
    })();

    state.conversationHistory.push({ role: 'user', content: msg.text });
    state.conversationHistory.push({ role: 'assistant', content: response });

    if (state.conversationHistory.length % 4 === 0) {
      await db.saveSession(state.sessionId, state.conversationHistory);
    }
  } catch (err: any) {
    sendError(`Pipeline failed: ${err.message}`);
  }
}
