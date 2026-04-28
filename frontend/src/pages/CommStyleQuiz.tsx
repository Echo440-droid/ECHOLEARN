import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { EchoCard } from "@/components/EchoCard";
import { MessageCircle, Lightbulb } from "lucide-react";

interface Message {
  id: number;
  from: string;
  emoji: string;
  variant: "warm" | "lavender" | "sage";
  message: string;
  replies: { label: string; style: string }[];
}

const messages: Message[] = [
  {
    id: 1,
    from: "A friend",
    emoji: "😄",
    variant: "warm",
    message: "Hey, I don't really get this topic we covered in class today. Can you explain it to me?",
    replies: [
      { label: "Sure! So basically think of it like this…", style: "analogy-first" },
      { label: "Yeah, step 1 is… step 2 is… step 3 is…", style: "structured" },
      { label: "Honestly same 😅 let's figure it out together", style: "collaborative" },
      { label: "I'll send you my notes, look at page 3", style: "resource-sharer" },
    ],
  },
  {
    id: 2,
    from: "A teacher",
    emoji: "📚",
    variant: "lavender",
    message: "You did well on the last assignment, but your explanation in Q4 could be clearer. Can you try rephrasing it?",
    replies: [
      { label: "Could you give me a hint on what part was unclear?", style: "clarifier" },
      { label: "Sure, here's another way to put it…", style: "confident-rephraser" },
      { label: "Can I explain it out loud instead of writing it?", style: "verbal-processor" },
      { label: "Let me think about it and get back to you", style: "reflective" },
    ],
  },
  {
    id: 3,
    from: "A parent",
    emoji: "🏠",
    variant: "sage",
    message: "How's studying going? Are you keeping up with everything?",
    replies: [
      { label: "Yeah! I actually understood something cool today", style: "enthusiastic" },
      { label: "It's fine. I've got a plan for the week", style: "planner" },
      { label: "Kinda struggling with one topic, but working on it", style: "honest-vulnerable" },
      { label: "All good 👍", style: "brief" },
    ],
  },
];

// Derive a comm style label from the selected styles
function deriveCommStyle(answers: string[]): string {
  const styleMap: Record<string, string> = {
    "analogy-first": "storyteller",
    structured: "structured",
    collaborative: "collaborative",
    "resource-sharer": "structured",
    clarifier: "clarifier",
    "confident-rephraser": "storyteller",
    "verbal-processor": "verbal",
    reflective: "reflective",
    enthusiastic: "storyteller",
    planner: "structured",
    "honest-vulnerable": "reflective",
    brief: "concise",
  };

  const mapped = answers.map((a) => styleMap[a] || "balanced");
  // Find the most common
  const counts: Record<string, number> = {};
  mapped.forEach((s) => (counts[s] = (counts[s] || 0) + 1));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "balanced";
}

export default function CommStyleQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  const msg = messages[current];
  const progress = (current / messages.length) * 100;

  const handleSelect = (style: string) => {
    const next = [...answers, style];
    setAnswers(next);
    if (current < messages.length - 1) {
      setTimeout(() => setCurrent(current + 1), 350);
    } else {
      // Derive and persist comm style for later user creation
      const commStyle = deriveCommStyle(next);
      sessionStorage.setItem("echolearn_comm_style", commStyle);
      sessionStorage.setItem("echolearn_comm_answers", JSON.stringify(next));
      setTimeout(() => navigate("/voice-setup"), 500);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-echo-sky/40 rounded-full px-4 py-2 mb-4">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-primary">Communication Style</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              How would you reply to these messages?
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              This helps me match how you naturally communicate.
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Message card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Incoming message bubble */}
              <EchoCard variant={msg.variant} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{msg.emoji}</span>
                  <span className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wide">
                    Message from {msg.from}
                  </span>
                </div>
                <p className="font-body text-foreground leading-relaxed text-[15px]">
                  "{msg.message}"
                </p>
              </EchoCard>

              {/* Reply options */}
              <p className="text-sm font-heading font-semibold text-foreground mb-4">
                You'd probably reply…
              </p>
              <div className="space-y-3">
                {msg.replies.map((r) => (
                  <EchoCard
                    key={r.style}
                    className="!p-4 flex items-center gap-3"
                    onClick={() => handleSelect(r.style)}
                  >
                    <span className="font-body text-foreground text-sm leading-snug">{r.label}</span>
                  </EchoCard>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Encouragement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center flex items-center justify-center gap-2 text-muted-foreground/60 text-sm font-body"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            There's no wrong answer — just pick what feels most natural
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
