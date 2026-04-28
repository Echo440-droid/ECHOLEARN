import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { EchoCard } from "@/components/EchoCard";
import { ProgressRing } from "@/components/ProgressRing";
import { ArrowLeft, Sparkles, TrendingUp, BookOpen, Target, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { getUserSessions, type Session } from "@/lib/api";

export default function Progress() {
  const navigate = useNavigate();
  const { userId, isOnboarded } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isOnboarded) navigate("/", { replace: true });
  }, [isOnboarded, navigate]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserSessions(userId)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate actual metrics from sessions
  const conceptsExplored = sessions.length;
  
  // Calculate average mastery rate
  const masteryScores = sessions.filter(s => s.progressPercent > 0).map(s => s.progressPercent);
  const avgMastery = masteryScores.length > 0 
    ? Math.round(masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length)
    : 0;

  // Rough streak calculation (days with activity)
  const uniqueDates = new Set(
    sessions.map(s => new Date(s.lastAccessedAt).toLocaleDateString())
  );
  const streakDays = uniqueDates.size;

  const insights = [
    { label: "Concepts explored", value: conceptsExplored.toString(), icon: BookOpen },
    { label: "Avg Mastery", value: `${avgMastery}%`, icon: Target },
    { label: "Active days", value: streakDays.toString(), icon: TrendingUp },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-10 max-w-lg mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-8 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </motion.button>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Here's how your thinking has grown
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Every concept you explore strengthens your understanding.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {insights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="echo-card !p-4 text-center"
            >
              <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-heading font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground font-body">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Topic breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Understanding by topic
          </h3>
          
          {sessions.length === 0 ? (
            <EchoCard variant="sage" className="text-center py-8">
              <p className="text-muted-foreground font-body text-sm">
                Upload some material to start tracking your progress!
              </p>
            </EchoCard>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => {
                const progress = session.progressPercent ?? 0;
                let status = "Just started";
                if (progress >= 80) status = "Strong";
                else if (progress >= 50) status = "Growing";
                else if (progress > 0) status = "Getting there";

                return (
                  <EchoCard 
                    key={session.id} 
                    delay={0.5 + i * 0.1} 
                    className="flex items-center gap-4 !p-4 cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`/explanation?sessionId=${session.id}`)}
                  >
                    <ProgressRing progress={progress} size={44} />
                    <div className="flex-1">
                      <h4 className="font-heading font-semibold text-foreground text-sm">
                        {session.topic?.name || "Untitled"}
                      </h4>
                      <p className="text-xs text-muted-foreground font-body">
                        {session.topic?.subject || "General"} · {status}
                      </p>
                    </div>
                    <span className="text-sm font-heading font-bold text-primary">{progress}%</span>
                  </EchoCard>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="echo-card text-center bg-echo-warm/40"
        >
          <p className="font-heading font-semibold text-foreground mb-1">
            You've explored {conceptsExplored} concept{conceptsExplored !== 1 ? 's' : ''} so far
          </p>
          <p className="text-sm text-muted-foreground font-body">
            Ready for the next layer? Keep going — you're doing great. ✨
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
