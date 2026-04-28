// ─── Audio Player Hook ──────────────────────────
// Queues base64 audio chunks from WS and plays them sequentially.

import { useRef, useCallback, useState } from 'react';

export function useAudioPlayer() {
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playNext = useCallback(async () => {
    if (isPlayingRef.current || queueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setIsPlaying(true);

    const base64 = queueRef.current.shift()!;
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const ctx = getAudioCtx();
      const buffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        activeSourceRef.current = null;
        isPlayingRef.current = false;
        if (queueRef.current.length > 0) {
          playNext();
        } else {
          setIsPlaying(false);
        }
      };
      activeSourceRef.current = source;
      source.start();
    } catch {
      // Skip corrupted chunk and continue
      activeSourceRef.current = null;
      isPlayingRef.current = false;
      if (queueRef.current.length > 0) {
        playNext();
      } else {
        setIsPlaying(false);
      }
    }
  }, []);

  const enqueue = useCallback(
    (base64Chunk: string) => {
      queueRef.current.push(base64Chunk);
      if (!isPlayingRef.current) playNext();
    },
    [playNext]
  );

  const clear = useCallback(() => {
    // Stop the currently playing audio source immediately
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.onended = null;  // prevent the onended callback
        activeSourceRef.current.stop();
      } catch {
        // ignore if already stopped
      }
      activeSourceRef.current = null;
    }
    queueRef.current = [];
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  return { enqueue, clear, isPlaying };
}
