// ─── Mastery Handler ────────────────────────────
// Handles the 'mastery_check' message: generates quiz questions from the topic.

import WebSocket from 'ws';
import { generateMasteryQuiz, buildTopicContext } from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

export async function handleMasteryCheck(
  _msg: object,
  _ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  sendError: (message: string) => void
): Promise<void> {
  if (!state.user || !state.topic?.fullText) return sendError('No topic loaded');

  try {
    send({ type: 'status', status: 'generating_quiz' });

    const questions = await generateMasteryQuiz(state.topic.fullText);
    send({ type: 'mastery_questions', questions });
  } catch (err: any) {
    sendError(`Mastery check failed: ${err.message}`);
  }
}
