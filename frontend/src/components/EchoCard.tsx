import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EchoCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  variant?: "default" | "sage" | "warm" | "lavender" | "sky";
}

const variantClasses = {
  default: "bg-card",
  sage: "bg-echo-sage/40",
  warm: "bg-echo-warm/60",
  lavender: "bg-echo-lavender/40",
  sky: "bg-echo-sky/40",
};

export function EchoCard({ children, className = "", onClick, delay = 0, variant = "default" }: EchoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px -8px hsl(16 60% 58% / 0.12)" }}
      className={`rounded-2xl border border-border p-6 transition-colors cursor-pointer ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
