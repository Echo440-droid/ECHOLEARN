// ─── AI Service ─────────────────────────────────
// Handles all Anthropic Claude interactions:
//   - System prompt building
//   - Conversation history summarization
//   - Progress estimation
//   - Mastery quiz generation
//   - Streaming tutor pipeline

import Anthropic from '@anthropic-ai/sdk';
import WebSocket from 'ws';
import { TONE_PRESETS, THOUGHT_PROFILES } from '../config/tonePresets';
import { streamTTS } from './tts.service';

// ─── Types ──────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  tone: string;
  thoughtProfile: string;
  warmth: number;
  voiceId: string | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// ─── Client ─────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── System Prompt Builder ──────────────────────

export function buildSystemPrompt(user: UserProfile, topicContext: string = ''): string {
  const tone = TONE_PRESETS[user.tone] || TONE_PRESETS.calm;
  const thoughtStyle = THOUGHT_PROFILES[user.thoughtProfile] || THOUGHT_PROFILES.mix;

  return `You are a personal AI tutor for ${user.name || 'the user'}. 
Your job is to explain concepts clearly, personally, and in a way that matches how they think.

TONE: ${tone.claudeInstruction}
TEACHING STYLE: ${thoughtStyle}
WARMTH LEVEL: ${user.warmth}/10 — ${user.warmth >= 7 ? 'Be warm, encouraging, and supportive.' : 'Keep it neutral and focused.'}

CRITICAL RULES:
- Keep responses conversational and spoken — no markdown, no bullet points, no headers.
- Speak as if talking out loud, not writing an essay.
- Use short sentences suitable for text-to-speech.
- Never say "certainly!" or "great question!" — just answer naturally.
- If you don't know something, say so honestly.
- End responses with a natural invitation for follow-up, like asking if they want to go deeper.

${topicContext ? `TOPIC CONTEXT (material the user uploaded):\n${topicContext}` : ''}`.trim();
}

// ─── Context Truncation ─────────────────────────
// Truncate topic text to fit Claude context safely (~60k chars ≈ ~15k tokens).

export function buildTopicContext(fullText: string | null | undefined, maxChars: number = 60000): string {
  if (!fullText) return '';
  return fullText.length > maxChars
    ? fullText.substring(0, maxChars) + '\n\n[Document truncated for context window]'
    : fullText;
}

// ─── History Summarization ──────────────────────
// Condense conversation history when it gets too long (> 20 turns).

export async function summarizeHistory(conversationHistory: ConversationMessage[]): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: 'You summarize tutoring conversations concisely for memory purposes.',
    messages: [
      {
        role: 'user',
        content: `Summarize this tutoring conversation in 3-5 sentences. Capture: what topics were covered, what the student understood, and any confusion or questions that came up.\n\n${JSON.stringify(conversationHistory)}`,
      },
    ],
  });
  return (response.content[0] as { type: 'text'; text: string }).text.trim();
}

// ─── Progress Estimation ────────────────────────
// Ask Claude to estimate % understood. Fire-and-forget at session end.

export async function estimateProgress(
  conversationHistory: ConversationMessage[],
  topicName: string
): Promise<number | null> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      system:
        'You are a learning assessment tool. Reply with a single integer between 0 and 100 only. No other text.',
      messages: [
        {
          role: 'user',
          content: `Based on this tutoring conversation about "${topicName}", what percentage of the core concepts has the student understood and engaged with? Reply with a number only.\n\nConversation:\n${JSON.stringify(conversationHistory)}`,
        },
      ],
    });
    const num = parseInt((response.content[0] as { type: 'text'; text: string }).text.trim(), 10);
    return isNaN(num) ? 50 : Math.min(100, Math.max(0, num));
  } catch {
    return null;
  }
}

// ─── Mastery Quiz Generation ────────────────────

export async function generateMasteryQuiz(topicText: string): Promise<QuizQuestion[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: 'You generate quiz questions in JSON format only. No markdown, no preamble.',
    messages: [
      {
        role: 'user',
        content: `Generate 5 quiz questions for this material. Return ONLY a JSON array like:
[{"question":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."}]

Material: ${buildTopicContext(topicText, 10000)}`,
      },
    ],
  });

  const raw = (response.content[0] as { type: 'text'; text: string }).text
    .trim()
    .replace(/```json|```/g, '');
  return JSON.parse(raw) as QuizQuestion[];
}

// ─── Main Tutor Pipeline ────────────────────────
// Streams Claude response → buffers sentences → sends to ElevenLabs TTS.
// Returns the full text response once complete.

export async function runTutorPipeline(params: {
  user: UserProfile;
  systemPrompt: string;
  messages: ConversationMessage[];
  ws: WebSocket;
  signal?: AbortSignal;
}): Promise<string> {
  const { user, systemPrompt, messages, ws, signal } = params;
  const voiceId = user.voiceId;
  const tonePreset = user.tone || 'calm';

  return new Promise((resolve, reject) => {
    let textBuffer = '';
    let fullResponseText = '';
    let ttsReady = false;
    let ttsInstance: ReturnType<typeof streamTTS> | null = null;
    let claudeStream: any = null;

    // Helper: check if pipeline was aborted
    const isAborted = () => signal?.aborted ?? false;

    // Listen for abort signal to tear down everything
    const onAbort = () => {
      // Don't call claudeStream.abort() — it throws uncatchable APIUserAbortError.
      // Instead, let the stream finish naturally; isAborted() guards block all output.
      ttsInstance?.close();
      resolve(fullResponseText);
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    const flush = (force: boolean = false) => {
      if (!ttsInstance || !ttsReady) return;
      // Send to ElevenLabs when we hit a sentence boundary or force flush
      if ((textBuffer.match(/[.!?]\s/) && textBuffer.length > 80) || force) {
        ttsInstance.sendText(textBuffer);
        textBuffer = '';
      }
    };

    if (!voiceId) {
      // No voice configured — text-only mode, skip TTS entirely
      (async () => {
        try {
          if (isAborted()) return resolve(fullResponseText);

          claudeStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
          });

          claudeStream.on('text', (text: string) => {
            if (isAborted()) return;
            fullResponseText += text;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'text_chunk', content: text }));
            }
          });

          claudeStream.on('finalMessage', () => {
            signal?.removeEventListener('abort', onAbort);
            if (isAborted()) return resolve(fullResponseText);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'text_done' }));
              ws.send(JSON.stringify({ type: 'audio_done' }));
            }
            resolve(fullResponseText);
          });

          claudeStream.on('error', (err: Error) => {
            signal?.removeEventListener('abort', onAbort);
            if (isAborted()) return resolve(fullResponseText);
            console.error('Claude stream error:', err.message);
            reject(err);
          });
        } catch (err) {
          signal?.removeEventListener('abort', onAbort);
          if (isAborted()) return resolve(fullResponseText);
          reject(err);
        }
      })();
      return;
    }

    if (isAborted()) {
      signal?.removeEventListener('abort', onAbort);
      return resolve(fullResponseText);
    }

    ttsInstance = streamTTS(
      voiceId,
      tonePreset,
      // onAudioChunk — forward to frontend (only if not aborted)
      (audioBase64: string) => {
        if (isAborted()) return;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'audio_chunk', audio: audioBase64 }));
        }
      },
      // onDone
      () => {
        signal?.removeEventListener('abort', onAbort);
        if (isAborted()) return resolve(fullResponseText);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'audio_done' }));
        }
        resolve(fullResponseText);
      },
      // onError
      (err: Error) => {
        signal?.removeEventListener('abort', onAbort);
        if (isAborted()) return resolve(fullResponseText);
        console.error('ElevenLabs TTS error:', err.message);
        reject(err);
      }
    );

    ttsReady = true;

    // Small delay to ensure EL WS is open before streaming starts
    setTimeout(async () => {
      try {
        if (isAborted()) {
          signal?.removeEventListener('abort', onAbort);
          return resolve(fullResponseText);
        }

        claudeStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        claudeStream.on('text', (text: string) => {
          if (isAborted()) return;
          fullResponseText += text;
          textBuffer += text;

          // Send text chunk to frontend for live transcript
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'text_chunk', content: text }));
          }

          flush();
        });

        claudeStream.on('finalMessage', () => {
          if (isAborted()) {
            signal?.removeEventListener('abort', onAbort);
            return resolve(fullResponseText);
          }
          // Flush remaining buffer
          if (textBuffer.trim().length > 0 && ttsInstance) {
            ttsInstance.sendText(textBuffer);
            textBuffer = '';
          }
          ttsInstance?.sendEOS();

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'text_done' }));
          }
        });

        claudeStream.on('error', (err: Error) => {
          signal?.removeEventListener('abort', onAbort);
          if (isAborted()) return resolve(fullResponseText);
          console.error('Claude stream error:', err.message);
          ttsInstance?.close();
          reject(err);
        });
      } catch (err) {
        signal?.removeEventListener('abort', onAbort);
        if (isAborted()) return resolve(fullResponseText);
        ttsInstance?.close();
        reject(err);
      }
    }, 300);
  });
}
