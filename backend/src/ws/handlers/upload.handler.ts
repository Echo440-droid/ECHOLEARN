// ─── Upload Handler ─────────────────────────────
// Handles 'upload_pdf' / 'upload_document' messages: parses PDF or DOCX,
// uploads to storage, creates topic & session.

import WebSocket from 'ws';
import * as db from '../../services/db.service';
import {
  detectFileType,
  extractTextFromDocument,
  uploadDocumentToStorage,
} from '../../services/pdf.service';
import {
  buildSystemPrompt,
  buildTopicContext,
  runTutorPipeline,
} from '../../services/ai.service';
import type { ConnectionState } from '../connection.handler';

// Allow-list of accepted MIME types (validated on the frontend too).
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx']);

export async function handleUploadDocument(
  msg: {
    fileName: string;
    fileBase64: string;
    topicName?: string;
    subject?: string;
    question?: string;
  },
  ws: WebSocket,
  state: ConnectionState,
  send: (obj: object) => void,
  sendError: (message: string) => void
): Promise<void> {
  if (!state.user) return sendError('Not initialized');

  try {
    send({ type: 'upload_status', status: 'parsing' });

    const fileBuffer = Buffer.from(msg.fileBase64, 'base64');

    // Validate file content via magic bytes (never trust the file extension alone).
    const fileType = detectFileType(fileBuffer);
    if (!fileType || !ALLOWED_EXTENSIONS.has(fileType)) {
      return sendError('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    const extractedText = await extractTextFromDocument(fileBuffer, fileType);

    send({ type: 'upload_status', status: 'uploading' });
    const storagePath = await uploadDocumentToStorage(
      state.user.id, fileBuffer, msg.fileName, fileType
    );

    const topic = await db.createTopic({
      userId: state.user.id,
      name: msg.topicName || msg.fileName,
      subject: msg.subject || 'General',
      sourceUrl: storagePath,
      fullText: extractedText,
    });

    const newSession = await db.createSession(state.user.id, topic.id);
    state.sessionId = newSession.id;
    state.topic = topic;
    state.conversationHistory = [];

    send({ type: 'upload_ok', topicId: topic.id, sessionId: state.sessionId, topicName: topic.name });

    // Auto-start explanation
    const question = msg.question || 'Explain the key concepts from this material.';
    const systemPrompt = buildSystemPrompt(state.user, buildTopicContext(extractedText));
    const messages = [{ role: 'user' as const, content: question }];

    const response = await runTutorPipeline({ user: state.user, systemPrompt, messages, ws });
    state.conversationHistory.push({ role: 'user', content: question });
    state.conversationHistory.push({ role: 'assistant', content: response });
    await db.saveSession(state.sessionId, state.conversationHistory);
  } catch (err: any) {
    sendError(`Document processing failed: ${err.message}`);
  }
}

// Backward-compatible alias so existing 'upload_pdf' messages still work.
export { handleUploadDocument as handleUploadPDF };

