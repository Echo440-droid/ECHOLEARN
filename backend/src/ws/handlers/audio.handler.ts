// ─── Audio Handler ──────────────────────────────
// Handles the 'audio_end' message: STT → Claude → TTS → audio back.

import WebSocket from 'ws';
import * as db from '../../services/db.service';
import { transcribeAudio } from '../../services/stt.service';
import {
  buildSystemPrompt,
  buildTopicContext,
  runTutorPipeline,
} from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

export async function handleAudioEnd(
  msg: { mimeType?: string },
  ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  sendError: (message: string) => void
): Promise<void> {
  if (!state.user || !state.sessionId) return sendError('Not initialized');
  if (state.audioChunks.length === 0) return sendError('No audio received');

  try {
    send({ type: 'status', status: 'transcribing' });

    // Combine all binary chunks into one buffer
    const fullAudio = Buffer.concat(state.audioChunks);
    state.audioChunks = [];

    // STT
    const transcript = await transcribeAudio(fullAudio, msg.mimeType || 'audio/webm');

    // If no speech was detected, skip the pipeline and reset to ready
    if (!transcript) {
      send({ type: 'transcript', text: '' });
      send({ type: 'audio_done' });
      return;
    }

    send({ type: 'transcript', text: transcript });
    send({ type: 'status', status: 'thinking' });

    // Build messages for Claude
    const topicContext = buildTopicContext(state.topic?.fullText);
    const systemPrompt = buildSystemPrompt(state.user, topicContext);

    const messages = [
      ...state.conversationHistory,
      { role: 'user' as const, content: transcript },
    ];

    // Create an abort controller so the pipeline can be interrupted
    const abort = new AbortController();
    state.pipelineAbort = abort;

    // Run tutor pipeline (with abort signal)
    const response = await runTutorPipeline({ user: state.user, systemPrompt, messages, ws, signal: abort.signal });

    // Clear the abort controller now that the pipeline has finished
    if (state.pipelineAbort === abort) state.pipelineAbort = null;

    // Save to history
    state.conversationHistory.push({ role: 'user', content: transcript });
    state.conversationHistory.push({ role: 'assistant', content: response });

    // Save session every 2 turns
    if (state.conversationHistory.length % 4 === 0) {
      await db.saveSession(state.sessionId, state.conversationHistory);
    }
  } catch (err: any) {
    sendError(`Pipeline failed: ${err.message}`);
    state.audioChunks = [];
  }
}
