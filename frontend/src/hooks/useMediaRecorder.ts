// ─── Media Recorder Hook ────────────────────────
// Reusable hook for capturing mic audio via MediaRecorder API.
// Returns binary chunks suitable for WebSocket streaming.

import { useRef, useCallback, useState } from 'react';

interface UseMediaRecorderOptions {
  mimeType?: string;
  onDataAvailable?: (chunk: Blob) => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const { mimeType = 'audio/webm;codecs=opus', onDataAvailable } = options;
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm',
      });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          onDataAvailable?.(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      recorderRef.current = recorder;
      // Collect data every 250ms for streaming
      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
      throw err;
    }
  }, [mimeType, onDataAvailable]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(new Blob(chunksRef.current, { type: mimeType }));
        setIsRecording(false);
        return;
      }

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  }, [mimeType]);

  return { startRecording, stopRecording, isRecording };
}
