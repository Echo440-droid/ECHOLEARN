// ─── Tone Presets ────────────────────────────────
// Maps the UI tone selector → ElevenLabs voice settings + Claude style instruction.

export interface TonePreset {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  claudeInstruction: string;
}

export const TONE_PRESETS: Record<string, TonePreset> = {
  calm: {
    stability: 0.80,
    similarity_boost: 0.75,
    style: 0.10,
    speed: 0.85,
    claudeInstruction:
      'Speak calmly and clearly. Use simple, measured language. Avoid rushed explanations.',
  },
  energetic: {
    stability: 0.40,
    similarity_boost: 0.80,
    style: 0.60,
    speed: 1.15,
    claudeInstruction:
      'Be enthusiastic and upbeat. Use dynamic language. Keep energy high.',
  },
  playful: {
    stability: 0.35,
    similarity_boost: 0.70,
    style: 0.75,
    speed: 1.05,
    claudeInstruction:
      'Be fun, use analogies, jokes, and casual language. Make it feel like chatting with a friend.',
  },
  serious: {
    stability: 0.85,
    similarity_boost: 0.85,
    style: 0.05,
    speed: 0.95,
    claudeInstruction:
      'Be precise and professional. Avoid filler. Get to the point quickly.',
  },
};

// ─── Thought Profiles ───────────────────────────
// Maps the quiz result → Claude teaching style instruction.

export const THOUGHT_PROFILES: Record<string, string> = {
  step_by_step:
    'Explain things step by step with clear logical progression. Number each step.',
  big_picture:
    'Always start with the big picture and why it matters before diving into details.',
  mix:
    'Balance big picture context with step-by-step detail as needed.',
};
