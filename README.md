# EchoLearn

A personalized AI tutor that teaches students using their own cloned voice. Students upload any learning material in form of PDFs — and receive real-time explanations spoken back in their own voice, in their own accent and language.

EchoLearn is built on the self-reference effect: people retain information significantly better when it is personally connected to them. By removing the cognitive distance of an unfamiliar voice, the platform improves engagement, comprehension, and retention. It adapts its explanations continuously until the student demonstrates mastery — not just completion.

---

## Features

- Voice cloning via a 10–15 second audio sample (ElevenLabs)
- Real-time tutoring session over WebSocket with sub-second audio latency
- Support for PDF, DOC, TXT
- Adaptive re-explanation based on student errors and hesitation points
- Mastery Check — Claude generates quiz questions from uploaded material
- Thought Profile — onboarding quiz that shapes how Claude explains concepts
- Progress tracking per topic across sessions

---

## Prerequisites

- Node.js >= 18.0.0
- An Anthropic API key — [console.anthropic.com](https://console.anthropic.com)
- An ElevenLabs API key — [elevenlabs.io](https://elevenlabs.io)
- A Deepgram API key (optional, free tier sufficient) — [deepgram.com](https://deepgram.com)

---

## Installation

```bash
git clone https://github.com/yourusername/echolearn.git
cd echolearn

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside `/backend`:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
DEEPGRAM_API_KEY=your_deepgram_key_here
PORT=8000
```

---

## Running Locally

```bash
# Terminal 1 — start the backend
cd backend
npm run dev

# Terminal 2 — start the frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

On first launch you will be prompted to record a short voice sample, select a tone preference, and complete the Thought Profile quiz. After onboarding, upload any learning material and begin a session.

---

## How a Session Works

```
1. Student speaks a question into the microphone
2. Audio is transcribed via STT (ElevenLabs or Deepgram)
3. Transcribed text is sent to the backend over WebSocket
4. Claude generates a response using the document context and conversation history
5. Response tokens are streamed to ElevenLabs TTS in real time
6. Audio is played back continuously in the student's cloned voice
```

The tutor does not advance until the student has demonstrated understanding. If an explanation does not land, Claude reformulates it based on the student's Thought Profile and prior errors.

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Claude `claude-sonnet-4-20250514` via Anthropic API |
| Voice Cloning + TTS | ElevenLabs Instant Voice Cloning + TTS WebSocket |
| Speech-to-Text | ElevenLabs STT or Deepgram (free tier) |
| Frontend | React |
| Backend | Node.js or Python FastAPI |
| File Parsing | PDF / DOC / TXT extraction, Whisper for video |
| Hosting | Vercel (frontend), Railway or Render (backend) |

---

## Project Structure

```
echolearn/
├── frontend/          # React application
│   └── src/
│       ├── components/
│       └── pages/
├── backend/           # Node.js / FastAPI server
│   ├── websocket/     # WebSocket server and Claude streaming
│   ├── tts/           # ElevenLabs TTS integration
│   ├── stt/           # Speech-to-text integration
│   └── parser/        # File and video transcript extraction
└── README.md
```

---

## Known Limitations

- Warmth and pace slider controls are present in the UI but backend parameter mapping is still in progress
- Video file upload within live chat is not supported; YouTube links are handled via transcript extraction separately

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you would like to change.

---

## License

MIT
