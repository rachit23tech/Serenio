/**
 * Session.tsx — Chat with Serenio
 * Route: /session
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory } from "../context/HistoryContext";
import { getTheme } from "../tokens";
import { ModelManager, ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';

interface Message { id: number; role: "ai" | "user"; text: string; time: string; }

const CRISIS_KEYWORDS = ['kill myself', 'killing myself', 'suicide', 'end my life', 'self harm', 'hurt myself', 'want to die'];
const CRISIS_RESPONSE = "You matter so much. Please call iCall at 9152987821 right now. I'm here with you.";

const SYSTEM_PROMPT = `You are a chill friend texting someone. Keep it real and casual.

RULES:
- Max 1 sentence reply. Always. Never more than 1 sentence.
- Never assume how someone feels
- Never use words like "normal", "valid", "totally", "absolutely"
- Don't start with "Hey!" every time
- Only ask about what they literally said, nothing extra
- Sound like a 22 year old texting a close friend
- No emojis unless user used one first
- No formal language at all

GOOD examples:
User: "I'm tired" → "rough day or just not sleeping well?"
User: "everything's good" → "nice, what's been keeping you busy?"
User: "idk" → "that's fair, take your time"
User: "I'm stressed about exams" → "how many do you have coming up?"
User: "feeling low" → "what's going on?"

BAD examples (never do this):
"It's totally normal to feel this way!"
"I understand how you feel, that must be hard."
"Here are some strategies that might help:"`;

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function Session() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { addSession } = useHistory();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "ai", text: "Hey there! I'm so glad you're here. How are you feeling today?", time: getTime() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const check = () => {
      const model = ModelManager.getLoadedModel(ModelCategory.Language);
      setModelReady(!!model);
      return !!model;
    };
    if (!check()) {
      const interval = setInterval(() => {
        if (check()) clearInterval(interval);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const isCrisis = (text: string) =>
    CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

  const saveToStorage = (userSaid: string, serenioSaid: string) => {
    const entry = { time: new Date().toLocaleString(), userSaid, serenioSaid, mood: null };
    const existing = JSON.parse(localStorage.getItem('serenio-history') || '[]');
    existing.unshift(entry);
    localStorage.setItem('serenio-history', JSON.stringify(existing));
  };

  const sendMessage = useCallback(async () => {
    const userText = input.trim();
    if (!userText || isTyping || processingRef.current) return;

    processingRef.current = true;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText, time: getTime() }]);
    setIsTyping(true);

    if (isCrisis(userText)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: CRISIS_RESPONSE, time: getTime() }]);
        setIsTyping(false);
        processingRef.current = false;
        saveToStorage(userText, CRISIS_RESPONSE);
        addSession({ type: 'chat', date: new Date(), mood: 'okay', userText, serenioResponse: CRISIS_RESPONSE });
      }, 400);
      return;
    }

    if (!modelReady) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "give me a sec, still loading 💙", time: getTime() }]);
        setIsTyping(false);
        processingRef.current = false;
      }, 400);
      return;
    }

    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userText}\nSerenio:`;
      const aiMsgId = Date.now() + 1;

      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', time: getTime() }]);
      setIsTyping(false);

      const { stream, result: resultPromise } = await TextGeneration.generateStream(fullPrompt, {
        maxTokens: 25,
        temperature: 0.8,
      });

      let accumulated = '';
      for await (const token of stream) {
        accumulated += token;
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, text: accumulated } : m
        ));
      }

      const result = await resultPromise;
      const finalText = (result.text || accumulated).trim();

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, text: finalText } : m
      ));

      saveToStorage(userText, finalText);
      addSession({ type: 'chat', date: new Date(), mood: 'okay', userText, serenioResponse: finalText });

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "something went wrong, try again", time: getTime() }]);
    } finally {
      setIsTyping(false);
      processingRef.current = false;
    }
  }, [input, isTyping, modelReady, addSession]);

  const chatBg = dark ? t.bg : "#FAF8F4";
  const aiBubbleBg = dark ? t.card : "#F5F1EB";
  const aiBubbleText = dark ? t.textPrimary : "#2D2D2D";
  const userBubbleBg = dark ? "#2A3855" : t.accent;
  const avatarBg = dark ? "#3D5A4A" : "#7DB591";
  const timeColor = dark ? t.textMuted : "#B0A99F";
  const inputBg = dark ? t.input : "#F5F1EB";
  const borderColor = dark ? t.border : "#EDE9E3";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="chat" />

      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", height: "100vh", background: chatBg }}>

        {/* Narrowed chat card */}
        <div style={{
          flex: 1, margin: "20px 200px 0",
          borderRadius: "16px 16px 0 0",
          background: dark ? t.card : "#F5F1EB",
          border: `1px solid ${borderColor}`,
          borderBottom: "none",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex", alignItems: "center", gap: 14,
            background: dark ? t.card : "#F5F1EB",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0, color: "#fff",
            }}>
              ✦
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: aiBubbleText, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
                Serenio
              </p>
              <p style={{ fontSize: 13, color: timeColor, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
                {modelReady ? "Your mental wellness companion" : "⏳ loading..."}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: msg.role === "ai" ? "row" : "column",
                alignItems: msg.role === "ai" ? "flex-start" : "flex-end",
                gap: msg.role === "ai" ? 12 : 6,
              }}>
                {msg.role === "ai" && (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: avatarBg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#fff",
                  }}>
                    ✦
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "ai" ? "flex-start" : "flex-end", gap: 4, maxWidth: "65%" }}>
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: msg.role === "ai" ? "4px 18px 18px 18px" : "18px 18px 4px 18px",
                    fontSize: 14, lineHeight: 1.65,
                    fontFamily: "'Nunito',sans-serif",
                    background: msg.role === "ai" ? aiBubbleBg : userBubbleBg,
                    color: msg.role === "ai" ? aiBubbleText : "#F5F1EB",
                    boxShadow: msg.role === "ai" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    border: msg.role === "ai" ? `1px solid ${borderColor}` : "none",
                  }}>
                    {msg.text || '...'}
                  </div>
                  <span style={{ fontSize: 11, color: timeColor, fontFamily: "'Nunito',sans-serif" }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: avatarBg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "#fff",
                }}>✦</div>
                <div style={{
                  padding: "14px 18px", borderRadius: "4px 18px 18px 18px",
                  background: aiBubbleBg, border: `1px solid ${borderColor}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: avatarBg,
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
        </div>

        {/* Input bar — same narrow width */}
        <div style={{
          margin: "0 200px 20px",
          padding: "16px 20px",
          background: dark ? t.card : "#F5F1EB",
          border: `1px solid ${borderColor}`,
          borderTop: "none",
          borderRadius: "0 0 16px 16px",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Share what's on your mind..."
              style={{
                flex: 1, padding: "12px 20px", borderRadius: 50,
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: aiBubbleText, fontSize: 14, outline: "none",
                fontFamily: "'Nunito',sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: !input.trim() || isTyping ? "#D4CFC9" : t.accent,
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: !input.trim() || isTyping ? 'not-allowed' : "pointer",
                flexShrink: 0, transition: "all 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
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