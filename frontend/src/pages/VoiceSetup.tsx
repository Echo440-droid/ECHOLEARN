import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Mic, Volume2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/hooks/useUser";
import { createUser, updatePreferences, uploadVoice, signUp } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const toneOptions = [
  { label: "Calm", value: "calm", emoji: "🌿" },
  { label: "Energetic", value: "energetic", emoji: "⚡" },
  { label: "Playful", value: "playful", emoji: "🎈" },
  { label: "Serious", value: "serious", emoji: "📘" },
];

export default function VoiceSetup() {
  const navigate = useNavigate();
  const { setUserId } = useUser();
  const { toast } = useToast();

  const [selectedTone, setSelectedTone] = useState("calm");
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [warmth, setWarmth] = useState([70]);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  // ─── Voice Recording ──────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        audioBlobRef.current = new Blob(audioChunksRef.current, { type: mimeType });
        setHasRecorded(true);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      toast({
        title: "Mic access denied",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ─── Create User & Save Preferences ───────────

  const handleContinue = async () => {
    setEmailError(null);

    // Validate email and password
    if (!email.trim()) {
      setEmailError("Email is required to create your account.");
      return;
    }
    if (!password || password.length < 6) {
      setEmailError("Password must be at least 6 characters.");
      return;
    }

    setIsSaving(true);

    try {
      // Gather accumulated onboarding data
      const thoughtProfile = sessionStorage.getItem("echolearn_thought_profile") || "mix";
      const commStyle = sessionStorage.getItem("echolearn_comm_style") || "balanced";

      // Create user via sign-up API (with email + hashed password)
      const user = await signUp({ email: email.trim(), password, name: email.trim().split("@")[0] });

      // Update preferences with all quiz data
      await updatePreferences(user.id, {
        tone: selectedTone,
        thoughtProfile,
        warmth: Math.round(warmth[0] / 10), // Convert 0-100 to 0-10
        commStyle,
      });

      // Upload voice sample if recorded
      if (audioBlobRef.current) {
        const reader = new FileReader();
        const audioBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(audioBlobRef.current!);
        });

        await uploadVoice(user.id, audioBase64, "audio/webm");
      }

      // Persist user ID across the app
      setUserId(user.id);

      // Clean up sessionStorage
      sessionStorage.removeItem("echolearn_thought_profile");
      sessionStorage.removeItem("echolearn_thought_answers");
      sessionStorage.removeItem("echolearn_comm_style");
      sessionStorage.removeItem("echolearn_comm_answers");

      toast({
        title: "You're all set! 🎉",
        description: "Your learning profile has been created.",
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("User creation failed:", err);
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-echo-warm/60 rounded-full px-4 py-2 mb-4">
              <Volume2 className="w-4 h-4 text-echo-warm-foreground" />
              <span className="text-sm font-body text-echo-warm-foreground">Voice Identity</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Now let's make this sound like you
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Record a short sample so your explanations feel personal.
            </p>
          </motion.div>

          {/* Voice recorder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="echo-card text-center mb-6"
          >
            <p className="text-sm text-muted-foreground font-body mb-4">
              Read aloud: <em>"The best way to learn something is to explain it to yourself."</em>
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-colors ${
                isRecording
                  ? "bg-destructive text-destructive-foreground animate-pulse-soft"
                  : hasRecorded
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {hasRecorded && !isRecording ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </motion.button>
            <p className="mt-3 text-xs text-muted-foreground/60 font-body">
              {isRecording ? "Recording… tap to stop" : hasRecorded ? "✓ Voice captured — tap to re-record" : "Tap to record"}
            </p>
          </motion.div>

          {/* Account creation fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="echo-card mb-6"
          >
            <p className="font-heading font-semibold text-foreground mb-4">Create your account</p>
            {emailError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive font-body mb-4">
                {emailError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label htmlFor="onboard-email" className="text-sm font-body text-muted-foreground mb-1 block">Email</label>
                <input
                  id="onboard-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="onboard-password" className="text-sm font-body text-muted-foreground mb-1 block">Password</label>
                <input
                  id="onboard-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Tone selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="echo-card mb-6"
          >
            <p className="font-heading font-semibold text-foreground mb-4">Choose your preferred tone</p>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSelectedTone(tone.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-body font-medium transition-all ${
                    selectedTone === tone.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="mr-2">{tone.emoji}</span>
                  {tone.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Warmth slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="echo-card mb-8"
          >
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-body text-foreground">Warmth</span>
                <span className="text-xs text-muted-foreground">
                  {warmth[0] < 33 ? "Direct" : warmth[0] < 66 ? "Balanced" : "Very warm"}
                </span>
              </div>
              <Slider value={warmth} onValueChange={setWarmth} max={100} step={1} />
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: isSaving ? 1 : 1.02 }}
            whileTap={{ scale: isSaving ? 1 : 0.98 }}
            onClick={handleContinue}
            disabled={isSaving}
            className="w-full bg-primary text-primary-foreground font-heading font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your profile…
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-center text-xs text-muted-foreground/50 font-body"
          >
            Voice recording is optional — you can skip it
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
