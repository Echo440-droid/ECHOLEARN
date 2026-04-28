import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { useUser } from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();
  const { setUserId, isOnboarded, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  if (!userLoading && isOnboarded) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signIn({ email: email.trim(), password });
      setUserId(user.id);

      toast({
        title: "Welcome back! 👋",
        description: "Redirecting to your dashboard…",
      });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Floating background shapes */}
        <motion.div
          className="absolute top-24 left-[10%] w-28 h-28 rounded-full bg-echo-lavender/25"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-28 right-[15%] w-20 h-20 rounded-full bg-echo-warm/40"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-44 right-[8%] w-14 h-14 rounded-full bg-echo-sage/30"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Sign-in card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-5 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-body text-muted-foreground">Welcome back</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-3">
                Sign in to{" "}
                <span className="echo-gradient-text">EchoLearn</span>
              </h1>

              <p className="text-muted-foreground font-body text-sm">
                Continue learning the way you understand.
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            onSubmit={handleSubmit}
            className="echo-card !p-8 space-y-5"
          >
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive font-body"
              >
                {error}
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="signin-email" className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="signin-password" className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full bg-primary text-primary-foreground font-heading font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl transition-shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground font-body"
          >
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-primary font-semibold hover:underline underline-offset-2 transition-all"
            >
              Get started
            </button>
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 text-center text-xs text-muted-foreground/40 font-body"
        >
          Built with care · In partnership with Angel Express
        </motion.footer>
      </div>
    </PageTransition>
  );
}
