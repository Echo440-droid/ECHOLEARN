// ─── EchoLearn WebSocket Hook ───────────────────
// Manages a single WebSocket connection to the backend.
// Exposes send(), sendBinary(), and an event-based message listener.

import { useEffect, useRef, useCallback, useState } from 'react';

// ─── Message Types (from backend) ───────────────

export type WSIncoming =
  | { type: 'init_ok'; sessionId: string; resuming: boolean; topicName: string }
  | { type: 'upload_status'; status: 'parsing' | 'uploading' }
  | { type: 'upload_ok'; topicId: string; sessionId: string; topicName: string }
  | { type: 'status'; status: 'transcribing' | 'thinking' | 'generating_quiz' }
  | { type: 'transcript'; text: string }
  | { type: 'text_chunk'; content: string }
  | { type: 'text_done' }
  | { type: 'audio_chunk'; audio: string }
  | { type: 'audio_done' }
  | { type: 'mastery_questions'; questions: MasteryQuestion[] }
  | { type: 'session_saved'; progress: number | null }
  | { type: 'error'; message: string };

export interface MasteryQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export type WSMessageHandler = (msg: WSIncoming) => void;

// ─── Hook ───────────────────────────────────────

export function useEchoWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<WSMessageHandler>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback((): Promise<void> => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket('wss://p01--echolearn--5fdqsgfwm5w8.code.run/ws');

      ws.onopen = () => {
        setIsConnected(true);
        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSIncoming;
          handlersRef.current.forEach((h) => h(msg));
        } catch {
          // binary or invalid JSON — ignore
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        reject(new Error('WebSocket connection failed'));
        ws.close();
      };

      wsRef.current = ws;
    });
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendBinary = useCallback((data: ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const onMessage = useCallback((handler: WSMessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { connect, disconnect, send, sendBinary, onMessage, isConnected };
}
