import type { Config } from "tailwindcss";

// Design tokens for OdeKorean — "Hangul Aurora" system.
// Rationale: Apple-keynote clarity (large type, soft shadow, generous white space)
// fused with a Korean-flag-derived aurora gradient (blue -> indigo -> vermilion)
// instead of a generic AI-purple gradient, so the palette is legible as *Korean*
// language learning, not a template SaaS look.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0F",           // near-black text (dark mode bg)
        paper: "#FFFFFF",
        mist: "#F5F5F7",          // Apple-style light gray surface
        graphite: "#1D1D1F",
        line: "#E5E5EA",
        aurora: {
          blue: "#0A5CFF",        // Taegeuk blue
          indigo: "#5E5CE6",
          vermilion: "#E0362E",   // Taegeuk red, desaturated for UI use
          gold: "#F5A623",        // trigram accent
        },
        success: "#12B76A",
        warning: "#F5A623",
        danger: "#E0362E",
      },
      fontFamily: {
        display: ["var(--font-display)", "Pretendard", "SF Pro Display", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Pretendard", "Inter", "system-ui", "sans-serif"],
        kr: ["var(--font-kr)", "Pretendard", "Noto Sans KR", "sans-serif"],
      },
      backgroundImage: {
        "aurora-mesh":
          "radial-gradient(60% 60% at 20% 20%, rgba(10,92,255,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, rgba(94,92,230,0.30) 0%, transparent 60%), radial-gradient(60% 60% at 50% 90%, rgba(224,54,46,0.22) 0%, transparent 60%)",
        "aurora-text": "linear-gradient(100deg,#0A5CFF 0%, #5E5CE6 45%, #E0362E 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)",
        softLg: "0 8px 24px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.10)",
        glow: "0 0 0 1px rgba(10,92,255,0.10), 0 8px 40px rgba(94,92,230,0.25)",
      },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.05)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        rise: "rise 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
