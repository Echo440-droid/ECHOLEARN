import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import mascotImg from "@/assets/echo-mascot.png";

/* ─── Floating UI Cards ────────────────────────────────── */

function TodaysGoalCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.7 }}
      className="absolute top-[12%] left-[2%] xl:left-[5%] z-20 hidden lg:block animate-float-bob"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.06] p-4 w-52 -rotate-3 border border-gray-100/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="text-xs font-semibold text-gray-700 font-heading">Today's Goal</span>
        </div>
        <p className="text-[11px] text-gray-500 font-body mb-2">Learn 3 new things</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-[10px] text-gray-400 font-body font-semibold">2/3</span>
        </div>
        <div className="absolute -bottom-1 -right-1 text-lg">🌱</div>
      </div>
    </motion.div>
  );
}

function SpeechBubbleCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.7 }}
      className="absolute top-[36%] left-[1%] xl:left-[3%] z-20 hidden lg:block animate-float-bob-slow"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.06] p-3 w-44 rotate-1 border border-gray-100/60 mb-2 relative">
        <p className="text-[11px] text-gray-600 font-body leading-relaxed">
          Hi! I'm <span className="font-bold text-echo-coral">Echo.</span><br/>Let's learn together!
        </p>
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-100/60" />
      </div>
      <img
        src={mascotImg}
        alt="Echo mascot"
        className="w-40 h-40 object-contain mx-auto -mt-1 drop-shadow-lg"
      />
    </motion.div>
  );
}

function ExplainingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.7 }}
      className="absolute top-[8%] right-[2%] xl:right-[5%] z-20 hidden lg:block animate-float-bob-alt"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.06] p-4 w-52 rotate-2 border border-gray-100/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h2l2-4 2 8 2-4h2" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-xs font-semibold text-gray-400 font-heading">Explaining...</span>
        </div>
        <p className="text-[12px] text-gray-700 font-body font-semibold leading-snug mb-2">
          Why does the sky look blue?
        </p>
        <div className="flex items-end gap-[3px] h-4">
          {[3, 7, 5, 10, 6, 8, 4, 9, 5, 7, 3, 6, 8, 4, 7, 5].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-echo-coral/60"
              style={{ height: `${h * 1.2}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function KeyIdeaCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9, duration: 0.7 }}
      className="absolute top-[40%] right-[1%] xl:right-[4%] z-20 hidden lg:block animate-float-bob-slow"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.06] p-4 w-48 -rotate-2 border border-gray-100/60">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-bold text-gray-400 font-heading uppercase tracking-wider">Key idea</span>
        </div>
        <p className="text-[11px] text-gray-600 font-body leading-relaxed">
          Light from the sun scatters in the atmosphere.
        </p>
      </div>
    </motion.div>
  );
}

function StreakCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.7 }}
      className="absolute bottom-[12%] right-[4%] xl:right-[8%] z-20 hidden lg:block animate-float-bob"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.06] p-4 w-52 rotate-2 border border-gray-100/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🏆</div>
          <div>
            <p className="text-xs font-bold text-gray-700 font-heading">You're on a roll!</p>
            <p className="text-[10px] text-gray-400 font-body">3 day streak</p>
          </div>
        </div>
        <div className="flex gap-1 mt-1.5 text-lg">
          <span>🔥</span><span>🔥</span><span>🔥</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Feature Item ─────────────────────────────────────── */
interface FeatureProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, iconBg, title, description }: FeatureProps) {
  return (
    <div className="flex items-start gap-4 p-6 flex-1 min-w-0">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-gray-800 font-heading mb-1">{title}</h3>
        <p className="text-xs text-gray-500 font-body leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Welcome (Landing) Page
   ═══════════════════════════════════════════════════════════ */
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
      {/* No local background — GlobalBackground in App.tsx handles it */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">

        {/* ══════════════ LOGO — top-left ══════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-30 px-6 lg:px-10 pt-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#B8C9B5] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3C6.5 3 4 5.5 4 9c0 2.5 1.2 4.8 3.2 5.8C6 13 5.5 11.2 5.5 9.2c0-2.6 1.6-4.8 3.5-5.2 1.8.8 3.5 3 3.5 5.2 0 2-.5 3.8-1.8 5 2.2-.9 3.8-3.2 3.8-5.8C14.5 5.5 12 3 9 3z" fill="#2D3B2D" fillOpacity="0.85"/>
              </svg>
            </div>
            <span className="text-lg font-heading font-bold text-gray-800 tracking-tight">EchoLearn</span>
          </div>
        </motion.div>

        {/* ══════════════ HERO SECTION ══════════════ */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-20 lg:pb-28">

          {/* Floating UI cards (desktop only) */}
          <TodaysGoalCard />
          <SpeechBubbleCard />
          <ExplainingCard />
          <KeyIdeaCard />
          <StreakCard />

          {/* Hero content */}
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-7"
            >
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-full px-5 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-body text-gray-500">Your personal learning companion</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display leading-[1.1] mb-6 text-gray-800"
            >
              Learn your way
              {/* Sparkle accent above the period */}
              <span className="relative inline-block">
                .
                <svg className="absolute -top-5 -right-1 w-4 h-4 text-echo-coral" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="currentColor" />
                </svg>
              </span>
              <br />
              <span className="text-echo-coral">In your own voice.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-base md:text-lg text-gray-500 font-body leading-relaxed max-w-lg mx-auto mb-8"
            >
              AI that helps break down concepts and teaches you what you need to know in{" "}
              <span className="text-echo-coral font-bold">your own voice.</span>
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.04, boxShadow: "0 10px 30px -8px rgba(249, 115, 22, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/quiz")}
              className="bg-echo-coral hover:bg-orange-600 text-white font-heading font-semibold text-lg px-10 py-4 rounded-full shadow-lg shadow-orange-300/30 transition-colors inline-flex items-center gap-2"
            >
              Start learning for free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-1">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            {/* Sign in link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-5 text-sm text-gray-400 font-body"
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-gray-500 font-semibold underline underline-offset-2 hover:text-gray-700 transition-colors"
              >
                Sign in
              </button>
            </motion.p>
          </div>
        </div>

        {/* ══════════════ FEATURES STRIP ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="relative z-20 bg-white/60 backdrop-blur-md border-t border-white/40 mx-4 lg:mx-12 mb-8 rounded-2xl shadow-sm"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:divide-x divide-gray-100/50">
            <FeatureItem
              iconBg="bg-orange-100"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="3" stroke="#F97316" strokeWidth="1.5"/>
                  <path d="M6 10h3M6 13h5" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14" cy="9" r="2" stroke="#F97316" strokeWidth="1.5"/>
                </svg>
              }
              title="Talk in your voice"
              description="Ask questions naturally. Echo explains in your own way."
            />
            <FeatureItem
              iconBg="bg-emerald-100"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#22C55E" strokeWidth="1.5"/>
                  <path d="M7 10c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5-1.5 3.5-3 3.5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="10" r="1.5" fill="#22C55E"/>
                </svg>
              }
              title="AI that understands"
              description="It breaks down tough concepts into simple, easy-to-get ideas."
            />
            <FeatureItem
              iconBg="bg-orange-100"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="3" stroke="#F97316" strokeWidth="1.5"/>
                  <path d="M7 7h6M7 10h4M7 13h5" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
              title="Personalized for you"
              description="Lessons adapt to your pace, level, and how you learn best."
            />
            <FeatureItem
              iconBg="bg-red-100"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 15l4-5 3 3 4-6 3 4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 6h3v3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Track your growth"
              description="See your progress, stay motivated, and achieve more!"
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 text-center pb-6 text-xs text-gray-400/60 font-body"
        >
          Built with care to help you learn.
        </motion.footer>
      </div>
    </PageTransition>
  );
}
