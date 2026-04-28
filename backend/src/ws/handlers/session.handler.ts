// ─── Session Handler ────────────────────────────
// Handles the 'end_session' message: saves session, estimates progress.

import WebSocket from 'ws';
import * as db from '../../services/db.service';
import { estimateProgress } from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

export async function handleEndSession(
  _msg: object,
  _ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  _sendError: (message: string) => void
): Promise<void> {
  if (!state.sessionId) return;

  try {
    const topicName = state.topic?.name || 'this topic';
    const progress = await estimateProgress(state.conversationHistory, topicName);
    await db.saveSession(state.sessionId, state.conversationHistory, progress);
    send({ type: 'session_saved', progress });
  } catch (err: any) {
    console.error('Error ending session:', err.message);
  }
}
