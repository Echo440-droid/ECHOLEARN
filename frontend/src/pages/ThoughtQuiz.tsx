import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { EchoCard } from "@/components/EchoCard";
import { Brain, Lightbulb } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "When solving a hard problem, do you prefer…",
    options: [
      { label: "Step-by-step logic", emoji: "🧩", value: "step_by_step" },
      { label: "Big picture intuition", emoji: "🌊", value: "big_picture" },
      { label: "A mix of both", emoji: "🔄", value: "mix" },
    ],
  },
  {
    id: 2,
    question: "What helps you learn faster?",
    options: [
      { label: "Real-world examples", emoji: "🏗️", value: "examples" },
      { label: "Formulas & definitions", emoji: "📐", value: "formal" },
      { label: "Stories & analogies", emoji: "📖", value: "stories" },
    ],
  },
  {
    id: 3,
    question: "Do you think things through…",
    options: [
      { label: "Out loud, talking it through", emoji: "🗣️", value: "verbal" },
      { label: "Quietly, inside my head", emoji: "🧠", value: "internal" },
      { label: "By writing things down", emoji: "✍️", value: "written" },
    ],
  },
  {
    id: 4,
    question: "When something's confusing, you prefer…",
    options: [
      { label: "A simpler explanation", emoji: "🎯", value: "simpler" },
      { label: "A different example", emoji: "💡", value: "different_angle" },
      { label: "To try it myself first", emoji: "🔨", value: "hands_on" },
    ],
  },
];

// Derive the thought profile from quiz answers
function deriveThoughtProfile(answers: string[]): string {
  const stepCount = answers.filter((a) =>
    ["step_by_step", "formal", "written", "simpler"].includes(a)
  ).length;
  const bigPicCount = answers.filter((a) =>
    ["big_picture", "stories", "verbal", "different_angle"].includes(a)
  ).length;

  if (stepCount >= 3) return "step_by_step";
  if (bigPicCount >= 3) return "big_picture";
  return "mix";
}

export default function ThoughtQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  const q = questions[current];
  const progress = (current / questions.length) * 100;

  const handleSelect = (value: string) => {
    const next = [...answers, value];
    setAnswers(next);
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300);
    } else {
      // Derive and persist thought profile for later user creation
      const thoughtProfile = deriveThoughtProfile(next);
      sessionStorage.setItem("echolearn_thought_profile", thoughtProfile);
      sessionStorage.setItem("echolearn_thought_answers", JSON.stringify(next));
      setTimeout(() => navigate("/comm-style"), 500);
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
            <div className="inline-flex items-center gap-2 bg-echo-lavender/40 rounded-full px-4 py-2 mb-4">
              <Brain className="w-4 h-4 text-echo-lavender-foreground" />
              <span className="text-sm font-body text-echo-lavender-foreground">Thought Profile</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Help me understand how your mind works
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              This helps me explain things the way your brain naturally prefers.
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

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-lg font-heading font-semibold text-foreground mb-6">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <EchoCard
                    key={opt.label}
                    className="flex items-center gap-4 !p-4"
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-body text-foreground font-medium">{opt.label}</span>
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
            No right or wrong answers — just how you think
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
