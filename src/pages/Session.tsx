import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useHistory } from '../context/HistoryContext';
import { useModelCache } from '../context/ModelCacheContext';
import { usePrivateMode } from '../context/PrivateModeContext';
import { PrivateModeToggleCompact } from '../components/PrivateModeToggle';
import { getTheme } from '../tokens';
import {
  FAST_CHAT_MAX_TOKENS,
  FAST_TEMPERATURE,
  detectMoodFromText,
  ensureLanguageModelLoaded,
  generateCompanionReply,
} from '../lib/companion';

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
  time: string;
  source?: 'model' | 'fallback';
}

let nextMessageId = Date.now();
function getNextMessageId() {
  nextMessageId += 1;
  return nextMessageId;
}

function getTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function Session() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { addSession } = useHistory();
  const { cacheState, chatReady, online, progress, statusText } = useModelCache();
  const { isPrivateMode } = usePrivateMode();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      text: "Hey, I'm here with you. Tell me what's been sitting heavy lately.",
      time: getTime(),
      source: 'fallback',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [statusLabel, setStatusLabel] = useState('Checking offline model...');
  const bottomRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let cancelled = false;

    const syncModelState = async () => {
      const ready = chatReady || await ensureLanguageModelLoaded();
      if (cancelled) return;
      setModelReady(ready);
      if (cacheState === 'downloading') {
        setStatusLabel(`${statusText} ${Math.round(progress * 100)}%`);
      } else if (ready) {
        setStatusLabel('Offline AI is saved and ready on this device');
      } else if (online) {
        setStatusLabel(statusText);
      } else {
        setStatusLabel('Offline fallback mode is active until the AI model has been cached once');
      }
    };

    void syncModelState();
    return () => {
      cancelled = true;
    };
  }, [cacheState, chatReady, online, progress, statusText]);

  useEffect(() => {
    if (!chatReady) return;
    setModelReady(true);
  }, [chatReady]);

  const sendMessage = useCallback(async () => {
    const userText = input.trim();
    if (!userText || isTyping || processingRef.current) return;

    processingRef.current = true;
    setInput('');
    const userMsgId = getNextMessageId();
    const aiMsgId = getNextMessageId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText, time: getTime() },
    ]);
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'ai', text: '', time: getTime(), source: 'fallback' },
    ]);

    try {
      const reply = await generateCompanionReply(userText, {
        maxTokens: FAST_CHAT_MAX_TOKENS,
        temperature: FAST_TEMPERATURE,
        stream: true,
        onToken: (_token, accumulated) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMsgId
                ? { ...message, text: accumulated, source: 'model' }
                : message,
            ),
          );
        },
      });

       setMessages((prev) =>
         prev.map((message) =>
           message.id === aiMsgId
             ? { ...message, text: reply.text, source: reply.source }
             : message,
         ),
       );

       setModelReady((prev) => prev || reply.source === 'model');
       setStatusLabel((current) => {
         if (reply.source === 'model' || chatReady || modelReady) {
           return 'Offline AI ready on this device';
         }
         return current;
       });

       // Only save to history if not in private mode
       if (!isPrivateMode) {
         addSession({
           type: 'chat',
           date: new Date(),
           mood: detectMoodFromText(userText),
           userText,
           serenioResponse: reply.text,
         });
       }
    } catch {
      const fallback = 'I hit a local error, so try that one more time and keep it short.';
      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMsgId
            ? { ...message, text: fallback, source: 'fallback' }
            : message,
        ),
      );
    } finally {
      setIsTyping(false);
      processingRef.current = false;
    }
  }, [addSession, input, isTyping, isPrivateMode]);

  const chatBg = dark ? t.bg : '#FAF8F4';
  const aiBubbleBg = dark ? t.card : '#F5F1EB';
  const aiBubbleText = dark ? t.textPrimary : '#2D2D2D';
  const userBubbleBg = dark ? '#2A3855' : t.accent;
  const avatarBg = dark ? '#3D5A4A' : '#7DB591';
  const timeColor = dark ? t.textMuted : '#B0A99F';
  const inputBg = dark ? t.input : '#F5F1EB';
  const borderColor = dark ? t.border : '#EDE9E3';

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="chat" />

      <div
        style={{
          flex: 1,
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: chatBg,
        }}
      >
        <div
          style={{
            flex: 1,
            margin: '20px clamp(16px, 6vw, 72px) 0',
            borderRadius: '16px 16px 0 0',
            background: dark ? t.card : '#F5F1EB',
            border: `1px solid ${borderColor}`,
            borderBottom: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              background: dark ? t.card : '#F5F1EB',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                  color: '#fff',
                }}
              >
                S
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: aiBubbleText, margin: 0, fontFamily: 'var(--font-sans)' }}>
                  Serenio
                </p>
                <p style={{ fontSize: 13, color: timeColor, margin: 0, fontFamily: 'var(--font-sans)' }}>
                  {statusLabel}
                </p>
              </div>
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: modelReady ? `${t.accent}22` : dark ? 'rgba(255,255,255,0.06)' : '#FFF4EA',
                color: modelReady ? t.accent : timeColor,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {modelReady ? 'Model cached' : 'Fallback mode'}
            </div>
            <PrivateModeToggleCompact />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'ai' ? 'row' : 'column',
                  alignItems: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                  gap: msg.role === 'ai' ? 12 : 6,
                }}
              >
                {msg.role === 'ai' && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: avatarBg,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    S
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                    gap: 4,
                    maxWidth: '70%',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: msg.role === 'ai' ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                      fontSize: 14,
                      lineHeight: 1.65,
                      fontFamily: 'var(--font-sans)',
                      background: msg.role === 'ai' ? aiBubbleBg : userBubbleBg,
                      color: msg.role === 'ai' ? aiBubbleText : '#F5F1EB',
                      boxShadow: msg.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      border: msg.role === 'ai' ? `1px solid ${borderColor}` : 'none',
                    }}
                  >
                    {msg.text || '...'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: timeColor, fontFamily: 'var(--font-sans)' }}>
                      {msg.time}
                    </span>
                    {msg.role === 'ai' && msg.text && (
                      <span
                        style={{
                          fontSize: 10,
                          color: msg.source === 'model' ? t.accent : timeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {msg.source === 'model' ? 'Offline model' : 'Local fallback'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: avatarBg,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  S
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '4px 18px 18px 18px',
                    background: aiBubbleBg,
                    border: `1px solid ${borderColor}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: avatarBg,
                          animation: 'bounce 0.8s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div
          style={{
            margin: '0 clamp(16px, 6vw, 72px) 20px',
            padding: '16px 20px',
            background: dark ? t.card : '#F5F1EB',
            border: `1px solid ${borderColor}`,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tell me what's going on..."
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 50,
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: aiBubbleText,
                fontSize: 14,
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: !input.trim() || isTyping ? '#D4CFC9' : t.accent,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
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




