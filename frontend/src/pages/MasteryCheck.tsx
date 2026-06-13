import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { EchoCard } from "@/components/EchoCard";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useSessionWS } from "@/hooks/useSessionWS";

export default function MasteryCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId, isOnboarded } = useUser();

  const paramSessionId = searchParams.get("sessionId");

  const {
    status,
    masteryQuestions,
    error,
    initSession,
    requestMastery,
    disconnectSession,
  } = useSessionWS();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [initialized, setInitialized] = useState(false);
 
  // Redirect if not logged in
  useEffect(() => {
    if (!isOnboarded) navigate("/", { replace: true });
  }, [isOnboarded, navigate]);

  // Init session and request mastery
  useEffect(() => {
    if (!userId || !paramSessionId || initialized) return;
    initSession(userId, { sessionId: paramSessionId });
    setInitialized(true);
  }, [userId, paramSessionId, initialized, initSession]);

  useEffect(() => {
    if (status === "ready" && !masteryQuestions) {
      requestMastery();
    }
  }, [status, masteryQuestions, requestMastery]);

  const handleChoiceSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
  };

  const handleNext = () => {
    if (masteryQuestions && current < masteryQuestions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      disconnectSession();
      navigate("/progress");
    }
  };

  const handleBack = () => {
    disconnectSession();
    navigate("/dashboard");
  };

  const isLoading = status === "connecting" || status === "initializing" || status === "generating_quiz";

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-10 max-w-lg mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-8 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </motion.button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Mastery Check</h2>
          <p className="text-muted-foreground font-body text-sm">
            Lets see how well you remember the concepts. No pressure – this is just a practice. 
          </p>

          {!isLoading && masteryQuestions && masteryQuestions.length > 0 && (
            <div className="mt-4 flex gap-2">
              {masteryQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4 text-center"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-heading font-semibold text-foreground">
              {status === "generating_quiz" ? "Generating your quiz…" : "Loading session…"}
            </p>
            <p className="text-sm text-muted-foreground font-body">Reviewing what we just covered</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-destructive font-body mb-4">{error || "Failed to load mastery check"}</p>
            <button onClick={handleBack} className="text-primary underline text-sm">
              Return to dashboard
            </button>
          </motion.div>
        )}

        {!isLoading && masteryQuestions && masteryQuestions.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="echo-card mb-6">
                <p className="font-heading font-semibold text-foreground text-lg mb-4">
                  {masteryQuestions[current].question}
                </p>

                <div className="space-y-3">
                  {masteryQuestions[current].options.map((opt, i) => {
                    const isCorrectAnswer = opt === masteryQuestions[current].answer;
                    const isSelected = selected === i;

                    let btnClass = "border-border hover:border-primary/30";
                    if (answered) {
                      if (isCorrectAnswer) {
                        btnClass = "border-secondary bg-secondary/20 text-foreground";
                      } else if (isSelected) {
                        btnClass = "border-destructive/50 bg-destructive/10 text-foreground";
                      } else {
                        btnClass = "border-border opacity-50";
                      }
                    } else if (isSelected) {
                      btnClass = "border-primary bg-primary/10";
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleChoiceSelect(i)}
                        disabled={answered}
                        className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-body transition-all ${btnClass}`}
                      >
                        <span className="flex items-center gap-2">
                          {answered && isSelected && isCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                          )}
                          {answered && isSelected && !isCorrectAnswer && (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          {opt}
                        </span>
                      </button>
                    );
                  })}

                  <AnimatePresence>
                    {answered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                          <p className="text-sm font-body text-foreground leading-relaxed">
                            <span className="font-semibold block mb-1">
                              {masteryQuestions[current].options[selected!] === masteryQuestions[current].answer
                                ? "Correct! 🎉"
                                : "Not quite. 💡"}
                            </span>
                            {masteryQuestions[current].explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!answered}
                className="w-full bg-primary text-primary-foreground font-heading font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
              >
                {current < masteryQuestions.length - 1 ? (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                ) : (
                  "See your progress"
                )}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}
