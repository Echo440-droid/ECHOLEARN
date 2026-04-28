// ─── TTS Service ────────────────────────────────
// Opens an ElevenLabs WebSocket to stream text → audio chunks.

import WebSocket from 'ws';
import { TONE_PRESETS } from '../config/tonePresets';

export interface TTSHandle {
  sendText: (text: string) => void;
  sendEOS: () => void;
  close: () => void;
}

export function streamTTS(
  voiceId: string,
  tonePreset: string,
  onAudioChunk: (audioBase64: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): TTSHandle {
  const preset = TONE_PRESETS[tonePreset] || TONE_PRESETS.calm;

  const elWs = new WebSocket(
    `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_turbo_v2_5`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' } }
  );

  elWs.on('open', () => {
    // Send BOS (beginning of stream) with voice settings
    elWs.send(
      JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: preset.stability,
          similarity_boost: preset.similarity_boost,
          style: preset.style,
          speed: preset.speed,
        },
        generation_config: {
          chunk_length_schedule: [120, 160, 250, 290],
        },
      })
    );
  });

  elWs.on('message', (raw: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(raw.toString()) as {
        audio?: string;
        isFinal?: boolean;
      };
      if (msg.audio) onAudioChunk(msg.audio); // base64 mp3 chunk
      if (msg.isFinal) onDone();
    } catch (e) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  });

  elWs.on('error', (err: Error) => onError(err));

  return {
    sendText: (text: string) => {
      if (elWs.readyState === WebSocket.OPEN) {
        elWs.send(JSON.stringify({ text }));
      }
    },
    sendEOS: () => {
      if (elWs.readyState === WebSocket.OPEN) {
        elWs.send(JSON.stringify({ text: '' }));
      }
    },
    close: () => {
      if (elWs.readyState === WebSocket.OPEN) elWs.close();
    },
  };
}
