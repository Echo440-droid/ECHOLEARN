// ─── REST API Routes ─────────────────────────────
// Handles operations that don't require a persistent WebSocket.

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as db from './services/db.service';
import { cloneVoice } from './services/voice.service';

const router = Router();

// ─── AUTH ────────────────────────────────────────

// POST /api/auth/signup — Create account with email + password
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if email already taken
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.createUser({ email, password: hashedPassword, name });
    // Don't send password back
    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signin — Authenticate with email + password
router.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Don't send password back
    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users ─────────────────────────────
// Create a new user during onboarding.

router.post('/users', async (req, res) => {
  try {
    const { name, email, tone, thoughtProfile, warmth, voiceId } = req.body;
    const user = await db.createUser({ name, email, tone, thoughtProfile, warmth, voiceId });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id ───────────────────────────
// Get a user's profile.

router.get('/users/:id', async (req, res) => {
  try {
    const user = await db.getUser(req.params.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ─── PATCH /api/users/:id/preferences ────────────
// Update voice/tone/personality preferences.

router.patch('/users/:id/preferences', async (req, res) => {
  try {
    const { tone, thoughtProfile, warmth, voiceId, commStyle, name } = req.body;
    const user = await db.updateUserPreferences(req.params.id, {
      tone,
      thoughtProfile,
      warmth,
      voiceId,
      commStyle,
      name,
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/topics ───────────────────
// List all topics uploaded by a user.

router.get('/users/:id/topics', async (req, res) => {
  try {
    const topics = await db.getUserTopics(req.params.id);
    res.json(topics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/sessions ─────────────────
// List all sessions with their topics (for "continue learning").

router.get('/users/:id/sessions', async (req, res) => {
  try {
    const sessions = await db.getUserSessions(req.params.id);
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users/:id/voice-clone ─────────────
// Accept a voice sample (base64 audio) and store voiceId.
// Returns a placeholder voiceId — real ElevenLabs voice cloning
// can be wired here when the API key supports it.

router.post('/users/:id/voice-clone', async (req, res) => {
  try {
    const { audioBase64, mimeType: _mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    // Call ElevenLabs Instant Voice Cloning API
    const voiceId = await cloneVoice(audioBase64);

    if (voiceId) {
      await db.updateUserPreferences(req.params.id, { voiceId });
    }

    res.json({ voiceId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
