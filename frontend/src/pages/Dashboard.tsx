import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { EchoCard } from "@/components/EchoCard";
import { ProgressRing } from "@/components/ProgressRing";
import { Upload, MessageCircleQuestion, BookOpen, TrendingUp, Timer, Brain, LogOut, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { getUserSessions, type Session } from "@/lib/api";

const colorCycle: Array<"sage" | "lavender" | "warm" | "sky"> = ["sage", "lavender", "warm", "sky"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userId, isLoading: userLoading, isOnboarded, logout } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (!userLoading && !isOnboarded) {
      navigate("/signin", { replace: true });
    }
  }, [userLoading, isOnboarded, navigate]);

  // Fetch sessions
  useEffect(() => {
    if (!userId) return;
    setLoadingSessions(true);
    getUserSessions(userId)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoadingSessions(false));
  }, [userId]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.name || "learner";
  const activeSessions = sessions.filter((s) => (s.progressPercent ?? 0) < 100);

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-muted-foreground font-body">
              You're building understanding, not just finishing tasks.
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Main actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <EchoCard variant="warm" delay={0.1} onClick={() => navigate("/upload")}>
            <Upload className="w-8 h-8 text-echo-warm-foreground mb-3" />
            <h3 className="font-heading font-semibold text-foreground text-lg mb-1">Upload something to learn</h3>
            <p className="text-sm text-muted-foreground font-body">PDFs, DOCX, notes, textbooks </p>
          </EchoCard>
          <EchoCard variant="sky" delay={0.2} onClick={() => navigate("/upload")}>
            <MessageCircleQuestion className="w-8 h-8 text-echo-sky-foreground mb-3" />
            <h3 className="font-heading font-semibold text-foreground text-lg mb-1">Ask a question</h3>
            <p className="text-sm text-muted-foreground font-body">Get it explained in your voice</p>
          </EchoCard>
        </div>

        {/* Continue learning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold text-foreground">Continue where you left off</h2>
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeSessions.length === 0 ? (
            <EchoCard variant="sage" className="text-center !py-8">
              <p className="text-muted-foreground font-body text-sm">
                No sessions yet — upload something to get started!
              </p>
            </EchoCard>
          ) : (
            <div className="space-y-3">
              {activeSessions.slice(0, 5).map((session, i) => (
                <EchoCard
                  key={session.id}
                  variant={colorCycle[i % colorCycle.length]}
                  delay={0.4 + i * 0.1}
                  onClick={() => navigate(`/explanation?sessionId=${session.id}`)}
                  className="flex items-center gap-4 !p-4"
                >
                  <ProgressRing progress={session.progressPercent ?? 0} />
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-foreground">
                      {session.topic?.name || "Untitled"}
                    </h4>
                    <p className="text-sm text-muted-foreground font-body">
                      {session.topic?.subject || "General"} · {session.progressPercent ?? 0}% understood
                    </p>
                  </div>
                </EchoCard>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tools row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold text-foreground">Learning Tools</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EchoCard
              variant="lavender"
              delay={0.7}
              onClick={() => {
                const lastSession = sessions[0];
                if (lastSession) navigate(`/mastery?sessionId=${lastSession.id}`);
              }}
              className="!p-4"
            >
              <Brain className="w-6 h-6 text-echo-lavender-foreground mb-2" />
              <h4 className="font-heading font-semibold text-foreground text-sm">Mastery Check</h4>
              <p className="text-xs text-muted-foreground font-body">Test your understanding</p>
            </EchoCard>
            <EchoCard variant="sage" delay={0.8} onClick={() => navigate("/progress")} className="!p-4">
              <Timer className="w-6 h-6 text-echo-sage-foreground mb-2" />
              <h4 className="font-heading font-semibold text-foreground text-sm">Your Progress</h4>
              <p className="text-xs text-muted-foreground font-body">See how you've grown</p>
            </EchoCard>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-xs text-muted-foreground/40 font-body pb-6"
        >
          EchoLearn · Learn in your own voice
        </motion.footer>
      </div>
    </PageTransition>
  );
}
