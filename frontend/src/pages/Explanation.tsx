import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { ArrowLeft, Mic, MicOff, ThumbsUp, Send, Loader2, Volume2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useSessionWS, type ChatMessage } from "@/hooks/useSessionWS";

// Waveform bar component
function WaveformBars({ active, count = 24, color = "bg-primary" }: { active: boolean; count?: number; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-[3px] rounded-full ${color} ${active ? "opacity-80" : "opacity-20"}`}
          animate={
            active
              ? { height: [6, 14 + Math.random() * 28, 8, 20 + Math.random() * 20, 6] }
              : { height: 6 }
          }
          transition={
            active
              ? {
                  duration: 0.8 + Math.random() * 0.6,
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}

export default function Explanation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId, isOnboarded } = useUser();

  const {
    status,
    sessionId: activeSessionId,
    topicName,
    messages,
    streamingText,
    isRecording,
    isAudioPlaying,
    error,
    startListening,
    stopListening,
    sendTextQuestion,
    endSession,
    initSession,
    disconnectSession,
  } = useSessionWS();

  const [textInput, setTextInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const paramSessionId = searchParams.get("sessionId");
  const paramTopicId = searchParams.get("topicId");

  // Redirect if not logged in
  useEffect(() => {
    if (!isOnboarded) navigate("/", { replace: true });
  }, [isOnboarded, navigate]);

  // Initialize session from URL params
  useEffect(() => {
    if (!userId || initialized) return;
    if (paramSessionId) {
      initSession(userId, { sessionId: paramSessionId });
      setInitialized(true);
    } else if (paramTopicId) {
      initSession(userId, { topicId: paramTopicId });
      setInitialized(true);
    }
    // If neither param is present, the user came from upload flow which handles init
  }, [userId, paramSessionId, paramTopicId, initialized, initSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
      disconnectSession();
    };
  }, []);

  const isTutorSpeaking = status === "speaking" || isAudioPlaying;
  const isThinking = status === "thinking" || status === "transcribing";
  const isReady = status === "ready";
  const isInitializing = status === "connecting" || status === "initializing";

  const handleSendText = () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    sendTextQuestion(text);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleDone = () => {
    endSession();
    navigate("/mastery?sessionId=" + (activeSessionId || paramSessionId || ""));
  };

  const handleBack = () => {
    endSession();
    disconnectSession();
    navigate("/dashboard");
  };

  const latestTutorMessage = [...messages].reverse().find((m) => m.role === "tutor");
  const latestStudentMessage = [...messages].reverse().find((m) => m.role === "student");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <div className="px-6 pt-10 pb-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-4 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-heading font-bold text-foreground mb-0.5">
              {topicName || "Learning Session"}
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Listen, ask questions, and learn at your own pace.
            </p>
          </motion.div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          {/* Loading / Initializing */}
          {isInitializing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-body">Setting up your session…</p>
            </motion.div>
          )}

          {/* Error state */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <p className="text-destructive font-body text-sm">{error || "Something went wrong"}</p>
              <button onClick={handleBack} className="text-sm text-primary font-body underline">
                Go back to dashboard
              </button>
            </motion.div>
          )}

          {/* Active Session */}
          {!isInitializing && status !== "error" && (
            <div className="w-full flex flex-col items-center gap-6">
              {/* Tutor section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 w-full"
              >
                {/* Tutor avatar with ring */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "3px solid hsl(var(--primary))",
                      opacity: isTutorSpeaking ? 1 : 0.15,
                    }}
                    animate={isTutorSpeaking ? { scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="w-20 h-20 rounded-full bg-echo-lavender/40 flex items-center justify-center relative z-10">
                    <span className="text-4xl">🎓</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-heading font-semibold text-foreground">Your Tutor</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={status}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground font-body"
                    >
                      {isThinking && "Thinking…"}
                      {isTutorSpeaking && "Speaking…"}
                      {isRecording && "Listening to you"}
                      {isReady && !isRecording && "Ready for your question"}
                      {status === "transcribing" && "Processing your speech…"}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Waveform */}
                <WaveformBars active={isTutorSpeaking} count={28} color="bg-primary" />

                {/* Streaming text / latest tutor message */}
                <AnimatePresence mode="wait">
                  {(streamingText || latestTutorMessage) && (
                    <motion.div
                      key={streamingText ? "streaming" : latestTutorMessage?.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-card/80 border border-border rounded-2xl px-5 py-4 max-w-sm w-full max-h-48 overflow-y-auto"
                    >
                      <p className="text-sm font-body text-foreground leading-relaxed text-center italic">
                        "{streamingText || latestTutorMessage?.text}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Thinking indicator */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-body">
                      {status === "transcribing" ? "Transcribing…" : "Thinking…"}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Divider */}
              <div className="w-16 h-px bg-border" />

              {/* Student section — only show if student has spoken */}
              <AnimatePresence>
                {latestStudentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-echo-warm/60 flex items-center justify-center">
                      <span className="text-lg">🎤</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body text-center max-w-xs">
                      "{latestStudentMessage.text}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Listening waveform */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <WaveformBars active={true} count={20} color="bg-destructive" />
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-destructive"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-xs text-muted-foreground font-body">Listening…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable messages history */}
              {messages.length > 2 && (
                <details className="w-full max-w-sm">
                  <summary className="text-xs text-muted-foreground/60 font-body cursor-pointer text-center mb-2">
                    Show conversation history ({messages.length} messages)
                  </summary>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-muted/30 rounded-xl p-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`text-xs font-body p-2 rounded-lg ${
                          m.role === "tutor"
                            ? "bg-echo-lavender/20 text-foreground"
                            : "bg-echo-warm/20 text-foreground ml-4"
                        }`}
                      >
                        <span className="font-semibold">{m.role === "tutor" ? "🎓 Tutor" : "🎤 You"}:</span>{" "}
                        {m.text.length > 150 ? m.text.slice(0, 150) + "…" : m.text}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        {!isInitializing && status !== "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-5 border-t border-border bg-background"
          >
            {/* Text input */}
            <div className="flex items-center gap-2 mb-4">
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                placeholder="Type a question instead…"
                disabled={!isReady && !isTutorSpeaking}
                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                onClick={handleSendText}
                disabled={!textInput.trim() || (!isReady && !isTutorSpeaking)}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-colors hover:border-primary/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-5">
              {/* Audio indicator */}
              {isAudioPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </motion.div>
              )}

              {/* Mic button — large, central */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleMicToggle}
                disabled={isThinking}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>

              {/* Got it */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDone}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary transition-colors hover:border-primary/30"
                title="I understand this"
              >
                <ThumbsUp className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-xs text-muted-foreground/60 font-body text-center mt-3">
              {isRecording ? "Speak now — tap to stop" : "Tap the mic to ask a question, or type below"}
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
