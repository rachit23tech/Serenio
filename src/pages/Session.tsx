/**
 * Session.tsx — Chat with Serenio
 * Send button uses t.accent — teal in dark, orange in light
 * Route: /session
 */

import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory } from "../context/HistoryContext";
import { getTheme } from "../tokens";

interface Message { id: number; role: "ai" | "user"; text: string; }

const AI_REPLIES = [
  "I hear you. It sounds like things have been weighing on you. You don't have to carry this alone.",
  "Thank you for sharing that. Your feelings are completely valid — let's sit with this together.",
  "That takes courage to say. I'm here with you, there's no rush.",
  "Sometimes naming what we feel is the hardest step. You've already done that.",
  "It makes sense you'd feel that way. What do you think is underneath that feeling?",
];

export default function Session() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { addSession } = useHistory();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "ai", text: "Hi! I'm here to listen. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: userText }]);
    setInput(""); setIsTyping(true);
    setTimeout(() => {
      const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: reply }]);
      setIsTyping(false);
      addSession({ type: "chat", date: new Date(), mood: "okay", userText, serenioResponse: reply });
    }, 1500);
  };

  // User bubble: light uses orange, dark uses muted navy-teal
  const userBubbleBg = dark ? "#2A3855" : t.accent;
  const userBubbleText = dark ? "#B8D8D8" : "#FFFFFF";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="chat" />

      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Header */}
        <div style={{ padding: "28px 36px 20px", flexShrink: 0, borderBottom: `1px solid ${t.border}`, background: t.bg }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: t.textPrimary, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
            Chat with Serenio
          </h1>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 120px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%", padding: "14px 18px", borderRadius: 20,
                fontSize: 14, lineHeight: 1.65, fontFamily: "'Nunito',sans-serif",
                background: msg.role === "ai" ? t.card : userBubbleBg,
                color: msg.role === "ai" ? t.textPrimary : userBubbleText,
                borderBottomLeftRadius: msg.role === "ai" ? 4 : 20,
                borderBottomRightRadius: msg.role === "user" ? 4 : 20,
                boxShadow: msg.role === "ai" ? t.cardShadow : "none",
                border: msg.role === "ai" ? `1px solid ${t.border}` : "none",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "14px 18px", borderRadius: 20, borderBottomLeftRadius: 4,
                background: t.card, border: `1px solid ${t.border}`, boxShadow: t.cardShadow,
              }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: t.accent,
                      animation: "bounce 0.8s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar — fixed at bottom */}
        <div style={{
          padding: "16px 36px 24px", flexShrink: 0,
          borderTop: `1px solid ${t.border}`, background: t.bg,
          position: "fixed", bottom: 0, left: 240, right: 0,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 720, margin: "0 auto" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type how you're feeling..."
              style={{
                flex: 1, padding: "14px 20px", borderRadius: 50,
                border: `1px solid ${t.border}`, background: t.input,
                color: t.textPrimary, fontSize: 14, outline: "none",
                boxShadow: t.cardShadow, fontFamily: "'Nunito',sans-serif",
              }}
            />
            {/* Send button — teal in dark, orange in light */}
            <button onClick={sendMessage} style={{
              width: 48, height: 48, borderRadius: "50%",
              background: t.accent,
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, boxShadow: t.btnShadow,
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.accentHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.accent; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}