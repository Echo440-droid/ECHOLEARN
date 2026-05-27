// ─── Session WebSocket Hook ─────────────────────
// Manages a tutoring session over WebSocket.
// Combines connection management, message handling, audio recording, and playback.

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEchoWS, type WSIncoming, type MasteryQuestion } from './useEchoWS';
import { useAudioPlayer } from './useAudioPlayer';
import { useMediaRecorder } from './useMediaRecorder';

export type SessionStatus =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'ready'
  | 'uploading'
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'generating_quiz'
  | 'error';

export interface ChatMessage {
  id: number;
  role: 'tutor' | 'student';
  text: string;
}

export function useSessionWS() {
  const { connect, disconnect, send, sendBinary, onMessage, isConnected } = useEchoWS();
  const { enqueue: enqueueAudio, clear: clearAudio, isPlaying: isAudioPlaying } = useAudioPlayer();

  const [status, setStatus] = useState<SessionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [masteryQuestions, setMasteryQuestions] = useState<MasteryQuestion[] | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const streamingTextRef = useRef('');
  const msgIdRef = useRef(0);

  // Audio recorder — sends binary chunks to WS
  const { startRecording, stopRecording, isRecording } = useMediaRecorder({
    onDataAvailable: (chunk) => {
      sendBinary(chunk);
    },
  });

  // ─── Message Handler ──────────────────────────

  useEffect(() => {
    const unsub = onMessage((msg: WSIncoming) => {
      switch (msg.type) {
        case 'init_ok':
          setSessionId(msg.sessionId);
          setTopicName(msg.topicName);
          setStatus('ready');
          break;

        case 'upload_status':
          setStatus('uploading');
          break;

        case 'upload_ok':
          setSessionId(msg.sessionId);
          setTopicName(msg.topicName);
          setStatus('ready');
          break;

        case 'status':
          if (msg.status === 'transcribing') setStatus('transcribing');
          else if (msg.status === 'thinking') setStatus('thinking');
          else if (msg.status === 'generating_quiz') setStatus('generating_quiz');
          break;

        case 'transcript':
          setTranscript(msg.text);
          // Add student message only if speech was actually detected
          if (msg.text && msg.text.trim()) {
            setMessages((prev) => [
              ...prev,
              { id: ++msgIdRef.current, role: 'student', text: msg.text },
            ]);
          }
          break;

        case 'text_chunk':
          streamingTextRef.current += msg.content;
          setStreamingText(streamingTextRef.current);
          setStatus('speaking');
          break;

        case 'text_done':
          // Finalize the tutor message but keep streamingText visible
          // until the user starts a new interaction (record / type)
          if (streamingTextRef.current.trim()) {
            setMessages((prev) => [
              ...prev,
              { id: ++msgIdRef.current, role: 'tutor', text: streamingTextRef.current.trim() },
            ]);
          }
          // NOTE: we intentionally do NOT clear streamingText here.
          // It will be cleared when the user clicks record or sends a new text question.
          break;

        case 'audio_chunk':
          enqueueAudio(msg.audio);
          break;

        case 'audio_done':
          setStatus('ready');
          break;

        case 'mastery_questions':
          setMasteryQuestions(msg.questions);
          setStatus('ready');
          break;

        case 'session_saved':
          setProgress(msg.progress);
          break;

        case 'error':
          setError(msg.message);
          setStatus('error');
          break;
      }
    });
    return unsub;
  }, [onMessage, enqueueAudio]);

  // ─── Actions ──────────────────────────────────

  const initSession = useCallback(
    async (userId: string, opts: { sessionId?: string; topicId?: string }) => {
      setStatus('connecting');
      try {
        await connect();
        send({ type: 'init', userId, ...opts });
        setStatus('initializing');
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
        setError('Failed to connect to server');
        setStatus('error');
      }
    },
    [connect, send]
  );

  const uploadPDF = useCallback(
    (file: { fileName: string; fileBase64: string; topicName?: string; subject?: string; question?: string }) => {
      setStatus('uploading');
      send({ type: 'upload_document', ...file });
    },
    [send]
  );

  const startListening = useCallback(async () => {
    // Tell backend to abort any in-flight pipeline (Claude + TTS)
    send({ type: 'interrupt' });
    // Clear previous tutor streaming text when user starts a new recording
    streamingTextRef.current = '';
    setStreamingText('');
    setStatus('listening');
    clearAudio();
    await startRecording();
  }, [startRecording, clearAudio, send]);

  const stopListening = useCallback(async () => {
    await stopRecording();
    send({ type: 'audio_end', mimeType: 'audio/webm;codecs=opus' });
    setStatus('transcribing');
  }, [stopRecording, send]);

  const sendTextQuestion = useCallback(
    (text: string) => {
      // Tell backend to abort any in-flight pipeline (Claude + TTS)
      send({ type: 'interrupt' });
      // Stop any playing tutor audio and clear previous streaming text
      clearAudio();
      streamingTextRef.current = '';
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        { id: ++msgIdRef.current, role: 'student', text },
      ]);
      send({ type: 'text_question', text });
      setStatus('thinking');
    },
    [send, clearAudio]
  );

  const requestMastery = useCallback(() => {
    send({ type: 'mastery_check' });
    setStatus('generating_quiz');
  }, [send]);

  const endSession = useCallback(() => {
    send({ type: 'end_session' });
  }, [send]);

  const disconnectSession = useCallback(() => {
    disconnect();
    setStatus('disconnected');
    setSessionId(null);
    clearAudio();
  }, [disconnect, clearAudio]);

  return {
    // State
    status,
    sessionId,
    topicName,
    messages,
    streamingText,
    transcript,
    error,
    masteryQuestions,
    progress,
    isConnected,
    isRecording,
    isAudioPlaying,

    // Actions
    initSession,
    uploadPDF,
    startListening,
    stopListening,
    sendTextQuestion,
    requestMastery,
    endSession,
    disconnectSession,
  };
}
