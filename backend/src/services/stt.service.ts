// ─── STT Service ────────────────────────────────
// Transcribes audio buffers via Deepgram Nova-2.

import fetch from 'node-fetch';

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const response = await fetch(
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': mimeType,
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Deepgram STT failed: ${err}`);
  }

  const result = (await response.json()) as {
    results?: {
      channels?: Array<{
        alternatives?: Array<{ transcript?: string }>;
      }>;
    };
  };

  const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

  return (transcript || '').trim();
}
