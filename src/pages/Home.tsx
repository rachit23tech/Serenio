/**
 * Home.tsx — Voice orb screen
 * Route: /home
 */

import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory } from "../context/HistoryContext";
import { getTheme } from "../tokens";

type VoiceState = "idle" | "listening" | "processing" | "responding";

const AI_REPLIES = [
  "I hear you. It sounds like things have been weighing on you. Take a breath — you're safe here.",
  "Thank you for sharing that. Your feelings are completely valid. I'm here with you.",
  "That takes courage. What you're going through sounds genuinely hard.",
  "Sometimes just speaking the words aloud can lighten the load. How does your body feel right now?",
];

function getOrbStyle(state: VoiceState, dark: boolean) {
  if (dark) {
    return {
      idle:       { bg: "radial-gradient(circle at 38% 32%, #9090CC 0%, #7AAAC0 45%, #68C0B8 80%, #60BEB0 100%)", glow: "rgba(96,190,176,0.3)"  },
      listening:  { bg: "radial-gradient(circle at 38% 32%, #A8A8E0 0%, #88C0D0 45%, #78D0C8 100%)",              glow: "rgba(120,208,200,0.45)" },
      processing: { bg: "radial-gradient(circle at 38% 32%, #8080BC 0%, #6898B0 100%)",                           glow: "rgba(104,152,176,0.35)" },
      responding: { bg: "radial-gradient(circle at 38% 32%, #68C0B8 0%, #5898B0 100%)",                           glow: "rgba(96,190,176,0.4)"  },
    }[state];
  }
  // Light mode — warm orange center → dusty rose → muted violet (matching reference)
  return {
    idle:       { bg: "radial-gradient(circle at 38% 32%, #D4845A 0%, #C07888 40%, #A888AA 75%, #9880B8 100%)", glow: "rgba(192,120,136,0.3)"  },
    listening:  { bg: "radial-gradient(circle at 38% 32%, #E09060 0%, #D08090 45%, #B898C0 100%)",              glow: "rgba(208,128,144,0.45)" },
    processing: { bg: "radial-gradient(circle at 38% 32%, #C07858 0%, #A06890 100%)",                           glow: "rgba(176,104,128,0.35)" },
    responding: { bg: "radial-gradient(circle at 38% 32%, #88B898 0%, #78A0B8 100%)",                           glow: "rgba(136,184,152,0.4)"  },
  }[state];
}

export default function Home() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { addSession } = useHistory();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [responseText, setResponseText] = useState("");
  const [orbScale, setOrbScale] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voiceState !== "listening") { setOrbScale(1); return; }
    let up = true;
    const id = setInterval(() => { setOrbScale(up ? 1.07 : 1); up = !up; }, 700);
    return () => clearInterval(id);
  }, [voiceState]);

  const handleOrbClick = () => {
    if (voiceState !== "idle") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setVoiceState("idle"); setResponseText(""); return;
    }
    setResponseText(""); setVoiceState("listening");
    timerRef.current = setTimeout(() => {
      setVoiceState("processing");
      timerRef.current = setTimeout(() => {
        setVoiceState("responding");
        const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
        setResponseText(reply);
        addSession({ type: "voice", date: new Date(), mood: "okay", userText: "Voice input", serenioResponse: reply });
        timerRef.current = setTimeout(() => setVoiceState("idle"), 7000);
      }, 1800);
    }, 3000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const orb = getOrbStyle(voiceState, dark);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="home" />

      <main style={{
        flex: 1, marginLeft: 240,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden",
        minHeight: "100vh",
      }}>
        {/* Subtle bg warmth */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: dark
            ? "radial-gradient(ellipse at 60% 40%, rgba(144,144,204,0.06) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 55% 45%, rgba(212,132,90,0.06) 0%, transparent 55%)",
        }} />

        {/* Outer glow */}
        <div style={{
          position: "absolute", width: 380, height: 380,
          borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(circle, ${orb.glow} 0%, transparent 70%)`,
          transition: "all 0.7s",
        }} />

        {/* Orb */}
        <button
          onClick={handleOrbClick}
          style={{
            width: 200, height: 200, borderRadius: "50%",
            background: orb.bg,
            transform: `scale(${orbScale})`,
            boxShadow: `0 24px 64px ${orb.glow}`,
            border: "none", cursor: "pointer",
            transition: "all 0.5s",
            marginBottom: 32, position: "relative", zIndex: 1,
          }}
        >
          {voiceState === "processing" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
              <svg style={{ width: 40, height: 40, color: "rgba(255,255,255,0.5)", animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.6 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
          {voiceState === "listening" && (
            <>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", animation: "ripple 1.5s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", animation: "ripple 1.5s ease-out infinite 0.5s" }} />
            </>
          )}
        </button>

        {/* Status text */}
        <h2 style={{
          fontSize: 20, fontWeight: 600, color: t.textPrimary,
          margin: "0 0 8px", textAlign: "center",
          zIndex: 1, fontFamily: "'Nunito',sans-serif",
        }}>
          {voiceState === "idle"       && "Hi, I'm Serenio. I'm here to listen."}
          {voiceState === "listening"  && "Listening…"}
          {voiceState === "processing" && "Understanding your thoughts…"}
          {voiceState === "responding" && "Here's what I'm thinking…"}
        </h2>
        <p style={{
          fontSize: 14, color: t.textMuted,
          margin: "0 0 24px", zIndex: 1,
          fontFamily: "'Nunito',sans-serif",
        }}>
          {voiceState === "idle"       && "Tap the orb to start speaking"}
          {voiceState === "listening"  && "Speak freely, I'm here"}
          {voiceState === "processing" && "Just a moment…"}
        </p>

        {/* Response card */}
        {responseText && (
          <div style={{
            maxWidth: 480, width: "100%",
            background: t.card, borderRadius: 16,
            padding: "20px 24px", marginBottom: 24,
            border: `1px solid ${t.border}`,
            boxShadow: t.cardShadow,
            position: "relative", zIndex: 1,
            fontFamily: "'Nunito',sans-serif",
          }}>
            <p style={{ fontSize: 12, color: t.accent, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Serenio</p>
            <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.7, margin: 0 }}>{responseText}</p>
          </div>
        )}

        {/* Privacy */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: t.textMuted, zIndex: 1,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Your voice never leaves this device
        </div>
      </main>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes ripple  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
      `}</style>
    </div>
  );
}