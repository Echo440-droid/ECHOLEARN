import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import heroBg from "@/assets/hero-bg.jpg";
import { Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function Welcome() {
  const navigate = useNavigate();
  const { isOnboarded, isLoading } = useUser();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!isLoading && isOnboarded) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isOnboarded, navigate]);

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-[15%] w-24 h-24 rounded-full bg-echo-sage/30"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-[20%] w-16 h-16 rounded-full bg-echo-warm/50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-40 right-[10%] w-12 h-12 rounded-full bg-echo-lavender/40"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-muted-foreground">Your personal learning companion</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6">
              <span className="echo-gradient-text">EchoLearn</span>
            </h1>

            <p className="text-xl md:text-2xl font-body text-muted-foreground leading-relaxed mb-4">
              Let's learn the way <em>you</em> understand.
            </p>
            <p className="text-base font-body text-muted-foreground/70 max-w-md mx-auto">
              A kind personal tutor who knows how you think and talks like you talk.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/quiz")}
            className="bg-primary text-primary-foreground font-heading font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            Get started
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-sm text-muted-foreground font-body"
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-primary font-semibold hover:underline underline-offset-2 transition-all"
            >
              Sign in
            </button>
          </motion.p>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 text-center text-xs text-muted-foreground/40 font-body"
        >
          Built with care to help you .
        </motion.footer>
      </div>
    </PageTransition>
  );
}
