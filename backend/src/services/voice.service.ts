// ─── Voice Cloning Service ──────────────────────
// Clones a voice via ElevenLabs Instant Voice Cloning API.
// Accepts raw audio bytes, writes to a temp file, uploads to ElevenLabs,
// and returns the new voice ID.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import FormData from 'form-data';

const API_KEY = process.env.ELEVENLABS_API_KEY || '';

export async function cloneVoice(audioBase64: string, voiceName?: string): Promise<string | null> {
  if (!API_KEY) {
    console.warn('ELEVENLABS_API_KEY not set — skipping voice cloning');
    return null;
  }

  const audioBytes = Buffer.from(audioBase64, 'base64');
  const filename = `voice_sample_${uuidv4()}.webm`;
  const tempDir = os.tmpdir();
  const tempFilepath = path.join(tempDir, filename);

  try {
    // Write audio to temp file
    fs.writeFileSync(tempFilepath, audioBytes);

    // Upload to ElevenLabs
    const form = new FormData();
    form.append('files', fs.createReadStream(tempFilepath), {
      filename,
      contentType: 'audio/webm',
    });
    form.append('name', voiceName || `echolearn_voice_${uuidv4().slice(0, 8)}`);

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
      },
      body: form as any,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs voice clone failed:', response.status, errText);
      return null;
    }

    const data = (await response.json()) as { voice_id?: string };
    return data.voice_id || null;
  } catch (err: any) {
    console.error('Voice cloning error:', err.message);
    return null;
  } finally {
    // Cleanup temp file
    try {
      fs.unlinkSync(tempFilepath);
    } catch {
      // ignore cleanup errors
    }
  }
}
