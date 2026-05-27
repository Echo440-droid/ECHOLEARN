// ─── Connection Handler ─────────────────────────
// Manages the WebSocket connection lifecycle, per-connection state, and message routing.

import WebSocket from 'ws';
import type { Topic } from '@prisma/client';
import type { ConversationMessage, UserProfile } from '../services/ai.service';
import * as db from '../services/db.service';

import { handleInit } from './handlers/init.handler';
import { handleUploadPDF, handleUploadDocument } from './handlers/upload.handler';
import { handleAudioEnd } from './handlers/audio.handler';
import { handleTextQuestion } from './handlers/text.handler';
import { handleMasteryCheck } from './handlers/mastery.handler';
import { handleEndSession } from './handlers/session.handler';

// ─── Per-Connection State ───────────────────────

export interface ConnectionState {
  sessionId: string | null;
  topic: Topic | null;
  user: UserProfile | null;
  conversationHistory: ConversationMessage[];
  audioChunks: Buffer[];
  /** AbortController for cancelling the active tutor pipeline (Claude + TTS) */
  pipelineAbort: AbortController | null;
}

// ─── Handle a New Connection ────────────────────

export function handleConnection(ws: WebSocket): void {
  console.log('Client connected');

  const state: ConnectionState = {
    sessionId: null,
    topic: null,
    user: null,
    conversationHistory: [],
    audioChunks: [],
    pipelineAbort: null,
  };

  const send = (obj: object): void => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  };

  const sendError = (message: string): void => {
    send({ type: 'error', message });
  };

  // ── MESSAGE HANDLER ─────────────────────────────

  ws.on('message', async (data: WebSocket.RawData, isBinary: boolean) => {
    // ── BINARY = audio chunk from frontend mic ──
    if (isBinary) {
      state.audioChunks.push(Buffer.from(data as Buffer));
      return;
    }

    // ── TEXT = JSON control messages ──
    let msg: any;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return sendError('Invalid JSON message');
    }

    switch (msg.type) {
      case 'init':
        await handleInit(msg, ws, state, send, sendError);
        break;

      case 'upload_pdf':
      case 'upload_document':
        await handleUploadDocument(msg, ws, state, send, sendError);
        break;

      case 'audio_end':
        await handleAudioEnd(msg, ws, state, send, sendError);
        break;

      case 'text_question':
        await handleTextQuestion(msg, ws, state, send, sendError);
        break;

      case 'mastery_check':
        await handleMasteryCheck(msg, ws, state, send, sendError);
        break;

      case 'interrupt':
        // Abort any in-flight tutor pipeline (Claude stream + TTS)
        if (state.pipelineAbort) {
          state.pipelineAbort.abort();
          state.pipelineAbort = null;
        }
        state.audioChunks = [];
        break;

      case 'end_session':
        await handleEndSession(msg, ws, state, send, sendError);
        break;

      default:
        sendError(`Unknown message type: ${msg.type}`);
    }
  });

  // ── DISCONNECT ────────────────────────────────

  ws.on('close', async () => {
    console.log('Client disconnected');
    // Auto-save on disconnect
    if (state.sessionId && state.conversationHistory.length > 0) {
      try {
        await db.saveSession(state.sessionId, state.conversationHistory);
      } catch (err: any) {
        console.error('Auto-save on disconnect failed:', err.message);
      }
    }
  });

  ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err.message);
  });
}
