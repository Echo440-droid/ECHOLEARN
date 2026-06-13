/**
 * GlobalBackground — premium mesh-gradient + doodle + orbital background
 * that spans the entire site seamlessly.
 *
 * Layers (bottom to top):
 *  1. Base warm cream fill
 *  2. Ultra-soft radial mesh gradient glows (800–1400px)
 *  3. Large orbital / planetary path ellipses
 *  4. Hand-drawn learning-themed doodle SVGs (individually positioned)
 */
export function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0, background: "#F8F4EE" }}
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════
          LAYER 1 — Mesh Gradient Glows
          ═══════════════════════════════════════════════ */}
      {/* Top-left: warm peach */}
      <div
        className="absolute"
        style={{
          top: "-15%", left: "-10%",
          width: "1100px", height: "1100px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,199,161,0.5) 0%, rgba(244,199,161,0) 70%)",
        }}
      />
      {/* Top-right: light lavender */}
      <div
        className="absolute"
        style={{
          top: "-8%", right: "-15%",
          width: "1000px", height: "1000px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(238,231,245,0.55) 0%, rgba(238,231,245,0) 70%)",
        }}
      />
      {/* Center: soft orange */}
      <div
        className="absolute"
        style={{
          top: "20%", left: "25%",
          width: "1200px", height: "1200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,138,91,0.18) 0%, rgba(224,138,91,0) 65%)",
        }}
      />
      {/* Lower-left: sage green */}
      <div
        className="absolute"
        style={{
          bottom: "-10%", left: "-12%",
          width: "1000px", height: "1000px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(215,230,212,0.45) 0%, rgba(215,230,212,0) 70%)",
        }}
      />
      {/* Lower-right: warm peach */}
      <div
        className="absolute"
        style={{
          bottom: "-5%", right: "-10%",
          width: "1100px", height: "1100px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,199,161,0.35) 0%, rgba(244,199,161,0) 70%)",
        }}
      />
      {/* Mid: lavender accent */}
      <div
        className="absolute"
        style={{
          top: "50%", left: "15%",
          width: "900px", height: "900px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(238,231,245,0.3) 0%, rgba(238,231,245,0) 70%)",
        }}
      />
      {/* Extra: soft orange mid-right */}
      <div
        className="absolute"
        style={{
          top: "35%", right: "0%",
          width: "800px", height: "800px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,138,91,0.12) 0%, rgba(224,138,91,0) 65%)",
        }}
      />

      {/* ═══════════════════════════════════════════════
          LAYER 2 — Orbital Path Ellipses
          ═══════════════════════════════════════════════ */}
      {/* Top-left orbital, clipped */}
      <svg className="absolute" style={{ top: "-20%", left: "-25%", width: "1000px", height: "600px" }}>
        <ellipse cx="500" cy="300" rx="480" ry="280" stroke="#D4845A" strokeWidth="1" opacity="0.07" fill="none" />
      </svg>
      {/* Top-right orbital */}
      <svg className="absolute" style={{ top: "-10%", right: "-20%", width: "900px", height: "500px" }}>
        <ellipse cx="450" cy="250" rx="420" ry="230" stroke="#C4A882" strokeWidth="1" opacity="0.06" fill="none" />
      </svg>
      {/* Center wide orbital */}
      <svg className="absolute" style={{ top: "30%", left: "-10%", width: "120%", height: "500px" }}>
        <ellipse cx="50%" cy="250" rx="45%" ry="240" stroke="#D7E6D4" strokeWidth="1" opacity="0.07" fill="none" />
      </svg>
      {/* Bottom-left orbital */}
      <svg className="absolute" style={{ bottom: "-15%", left: "-20%", width: "900px", height: "500px" }}>
        <ellipse cx="450" cy="250" rx="430" ry="240" stroke="#E8956A" strokeWidth="1" opacity="0.06" fill="none" />
      </svg>
      {/* Bottom-right orbital */}
      <svg className="absolute" style={{ bottom: "5%", right: "-15%", width: "800px", height: "450px" }}>
        <ellipse cx="400" cy="225" rx="380" ry="210" stroke="#EEE7F5" strokeWidth="1" opacity="0.07" fill="none" />
      </svg>

      {/* ═══════════════════════════════════════════════
          LAYER 3 — Learning-Themed Doodles
          Each is an individually positioned SVG element.
          ═══════════════════════════════════════════════ */}

      {/* ── "1+1=2" math text ── */}
      <svg className="absolute" style={{ top: "8%", left: "12%" }} width="110" height="40" viewBox="0 0 110 40" fill="none">
        <text x="5" y="28" fontFamily="'Nunito', sans-serif" fontSize="24" fill="#D4845A" fontWeight="700" opacity="0.12">1+1=2</text>
      </svg>

      {/* ── Plus sign top-right ── */}
      <svg className="absolute" style={{ top: "14%", right: "18%" }} width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line x1="14" y1="3" x2="14" y2="25" stroke="#D4845A" strokeWidth="3" strokeLinecap="round" opacity="0.13" />
        <line x1="3" y1="14" x2="25" y2="14" stroke="#D4845A" strokeWidth="3" strokeLinecap="round" opacity="0.13" />
      </svg>

      {/* ── Star sparkle top-center ── */}
      <svg className="absolute" style={{ top: "6%", left: "45%" }} width="24" height="24" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#E8956A" opacity="0.14" />
      </svg>

      {/* ── Squiggly wave — left ── */}
      <svg className="absolute" style={{ top: "28%", left: "3%" }} width="120" height="30" viewBox="0 0 120 30" fill="none">
        <path d="M5 15 Q18 2 31 15 Q44 28 57 15 Q70 2 83 15 Q96 28 115 15" stroke="#E8956A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.10" />
      </svg>

      {/* ── Sigma Σ — right side ── */}
      <svg className="absolute" style={{ top: "20%", right: "8%" }} width="40" height="50" viewBox="0 0 40 50" fill="none">
        <text x="5" y="38" fontFamily="'Nunito', sans-serif" fontSize="42" fill="#D4845A" fontWeight="300" opacity="0.09">Σ</text>
      </svg>

      {/* ── Circle (dashed) — left ── */}
      <svg className="absolute" style={{ top: "40%", left: "8%" }} width="50" height="50" viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="20" stroke="#E8956A" strokeWidth="2" fill="none" strokeDasharray="5 7" opacity="0.10" />
      </svg>

      {/* ── Triangle — right-center ── */}
      <svg className="absolute" style={{ top: "45%", right: "12%" }} width="40" height="40" viewBox="0 0 40 40" fill="none">
        <polygon points="20,4 38,36 2,36" stroke="#C4A882" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.09" />
      </svg>

      {/* ── Lightbulb — top-left area ── */}
      <svg className="absolute" style={{ top: "55%", left: "15%" }} width="36" height="48" viewBox="0 0 36 48" fill="none" opacity="0.10">
        <circle cx="18" cy="16" r="12" stroke="#E8956A" strokeWidth="1.8" fill="none" />
        <path d="M13 28h10M14 32h8" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 26 Q13 21 18 18 Q23 21 23 26" stroke="#E8956A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <line x1="18" y1="0" x2="18" y2="3" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="6" x2="7.5" y2="8.5" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="31" y1="6" x2="28.5" y2="8.5" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="16" x2="3" y2="16" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="33" y1="16" x2="36" y2="16" stroke="#E8956A" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* ── Book — bottom-left ── */}
      <svg className="absolute" style={{ bottom: "18%", left: "6%" }} width="64" height="36" viewBox="0 0 64 36" fill="none" opacity="0.09">
        <path d="M4 6 Q18 2 32 6 L32 32 Q18 28 4 32 Z" stroke="#D4845A" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <path d="M32 6 Q46 2 60 6 L60 32 Q46 28 32 32 Z" stroke="#D4845A" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <line x1="32" y1="6" x2="32" y2="32" stroke="#D4845A" strokeWidth="1.8" />
      </svg>

      {/* ── Pi π — center-right ── */}
      <svg className="absolute" style={{ top: "65%", right: "20%" }} width="30" height="35" viewBox="0 0 30 35" fill="none">
        <text x="3" y="28" fontFamily="'Nunito', sans-serif" fontSize="30" fill="#C4A882" fontWeight="600" opacity="0.10">π</text>
      </svg>

      {/* ── Infinity ∞ — bottom center ── */}
      <svg className="absolute" style={{ bottom: "10%", left: "40%" }} width="45" height="30" viewBox="0 0 45 30" fill="none">
        <text x="3" y="24" fontFamily="'Nunito', sans-serif" fontSize="28" fill="#D4845A" fontWeight="700" opacity="0.10">∞</text>
      </svg>

      {/* ── Dots cluster — top-right ── */}
      <svg className="absolute" style={{ top: "10%", right: "30%" }} width="50" height="40" viewBox="0 0 50 40" fill="none" opacity="0.12">
        <circle cx="8" cy="10" r="3.5" fill="#E8956A" /><circle cx="22" cy="6" r="3" fill="#D4845A" />
        <circle cx="38" cy="12" r="4" fill="#E8956A" /><circle cx="14" cy="28" r="2.5" fill="#D4845A" />
        <circle cx="32" cy="30" r="3.5" fill="#E8956A" />
      </svg>

      {/* ── Curved arrow — center ── */}
      <svg className="absolute" style={{ top: "50%", left: "42%" }} width="70" height="30" viewBox="0 0 70 30" fill="none" opacity="0.09">
        <path d="M5 20 Q25 2 55 12" stroke="#D4845A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 6 L57 13 L48 16" stroke="#D4845A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* ── Equal sign — left-center ── */}
      <svg className="absolute" style={{ top: "35%", left: "22%" }} width="26" height="18" viewBox="0 0 26 18" fill="none" opacity="0.10">
        <line x1="3" y1="5" x2="23" y2="5" stroke="#D4845A" strokeWidth="3" strokeLinecap="round" />
        <line x1="3" y1="13" x2="23" y2="13" stroke="#D4845A" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* ── Star — bottom-right ── */}
      <svg className="absolute" style={{ bottom: "22%", right: "8%" }} width="28" height="28" viewBox="0 0 20 20" fill="none">
        <path d="M10 1L12.2 6.8H18.5L13.3 10.6L15.2 16.8L10 13L4.8 16.8L6.7 10.6L1.5 6.8H7.8L10 1Z" fill="#E8956A" opacity="0.11" />
      </svg>

      {/* ── Zigzag — bottom ── */}
      <svg className="absolute" style={{ bottom: "5%", left: "15%" }} width="100" height="20" viewBox="0 0 100 20" fill="none" opacity="0.08">
        <path d="M3 12 L14 4 L25 12 L36 4 L47 12 L58 4 L69 12 L80 4 L91 12" stroke="#C4A882" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* ── Plus sign — bottom-left ── */}
      <svg className="absolute" style={{ bottom: "30%", left: "35%" }} width="22" height="22" viewBox="0 0 22 22" fill="none">
        <line x1="11" y1="2" x2="11" y2="20" stroke="#D7E6D4" strokeWidth="2.5" strokeLinecap="round" opacity="0.12" />
        <line x1="2" y1="11" x2="20" y2="11" stroke="#D7E6D4" strokeWidth="2.5" strokeLinecap="round" opacity="0.12" />
      </svg>

      {/* ── Percent % — right ── */}
      <svg className="absolute" style={{ top: "72%", right: "5%" }} width="30" height="35" viewBox="0 0 30 35" fill="none">
        <text x="2" y="28" fontFamily="'Nunito', sans-serif" fontSize="30" fill="#D4845A" fontWeight="300" opacity="0.08">%</text>
      </svg>

      {/* ── Grid / hashtag — center-left ── */}
      <svg className="absolute" style={{ top: "60%", left: "30%" }} width="28" height="28" viewBox="0 0 28 28" fill="none" opacity="0.08">
        <line x1="9" y1="2" x2="9" y2="26" stroke="#D7E6D4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="19" y1="2" x2="19" y2="26" stroke="#D7E6D4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="2" y1="9" x2="26" y2="9" stroke="#D7E6D4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="2" y1="19" x2="26" y2="19" stroke="#D7E6D4" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* ── Small circle — top-left ── */}
      <svg className="absolute" style={{ top: "18%", left: "5%" }} width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#D7E6D4" strokeWidth="1.8" fill="none" opacity="0.10" />
      </svg>

      {/* ── Pencil — bottom-right ── */}
      <svg className="absolute" style={{ bottom: "14%", right: "25%" }} width="30" height="50" viewBox="0 0 12 44" fill="none" opacity="0.08" transform="rotate(-25)">
        <rect x="2" y="0" width="8" height="34" rx="1.5" stroke="#D4845A" strokeWidth="1.5" fill="none" />
        <path d="M2 34 L6 42 L10 34" stroke="#D4845A" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <line x1="2" y1="5" x2="10" y2="5" stroke="#D4845A" strokeWidth="1" />
      </svg>

      {/* ── Squiggly wave — right side ── */}
      <svg className="absolute" style={{ top: "75%", right: "3%" }} width="90" height="25" viewBox="0 0 90 25" fill="none">
        <path d="M5 12 Q16 2 27 12 Q38 22 49 12 Q60 2 71 12 Q82 22 88 12" stroke="#C4A882" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.09" />
      </svg>

      {/* ── Star sparkle — center ── */}
      <svg className="absolute" style={{ top: "42%", left: "55%" }} width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#D4845A" opacity="0.10" />
      </svg>

      {/* ── Circle (solid line) — bottom ── */}
      <svg className="absolute" style={{ bottom: "25%", left: "50%" }} width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="12" stroke="#E8956A" strokeWidth="1.5" fill="none" opacity="0.09" />
      </svg>

      {/* ── Square root √ — center-right ── */}
      <svg className="absolute" style={{ top: "58%", right: "30%" }} width="45" height="30" viewBox="0 0 45 30" fill="none" opacity="0.09">
        <path d="M5 20 L12 25 L25 5 L40 5" stroke="#D4845A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* ── Dots — bottom-left ── */}
      <svg className="absolute" style={{ bottom: "8%", left: "5%" }} width="45" height="35" viewBox="0 0 45 35" fill="none" opacity="0.10">
        <circle cx="8" cy="8" r="3" fill="#D4845A" /><circle cx="24" cy="5" r="2.5" fill="#C4A882" />
        <circle cx="38" cy="10" r="3.5" fill="#D4845A" /><circle cx="16" cy="25" r="3" fill="#C4A882" />
      </svg>

      {/* ── "x²" math — mid-left ── */}
      <svg className="absolute" style={{ top: "48%", left: "3%" }} width="40" height="30" viewBox="0 0 40 30" fill="none">
        <text x="3" y="22" fontFamily="'Nunito', sans-serif" fontSize="20" fill="#D4845A" fontWeight="600" opacity="0.10">x²</text>
      </svg>

      {/* ── Triangle — top area ── */}
      <svg className="absolute" style={{ top: "3%", left: "70%" }} width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 30,28 2,28" stroke="#E8956A" strokeWidth="1.8" fill="none" strokeLinejoin="round" opacity="0.09" />
      </svg>

      {/* ── Plus — far right mid ── */}
      <svg className="absolute" style={{ top: "68%", right: "14%" }} width="20" height="20" viewBox="0 0 20 20" fill="none">
        <line x1="10" y1="2" x2="10" y2="18" stroke="#E8956A" strokeWidth="2.5" strokeLinecap="round" opacity="0.11" />
        <line x1="2" y1="10" x2="18" y2="10" stroke="#E8956A" strokeWidth="2.5" strokeLinecap="round" opacity="0.11" />
      </svg>
    </div>
  );
}
