import { useState, useRef, useCallback, useEffect } from 'react';
import { ModelManager, ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SYSTEM_PROMPT = `You are Serenio, a warm caring friend. You talk like a real person texting a close friend.

Rules you NEVER break:
- Never give advice unless the person asks "what should I do"
- Never make lists
- Never use bullet points
- Never say "I understand" or "I hear you" as your first word every time
- Never be repetitive
- Never sound like a therapist or doctor
- Always respond in maximum 2 short sentences
- Always end with either a gentle question or just a simple caring statement
- Never use asterisks or markdown

Your personality:
- Warm, calm, real
- You validate feelings first
- You are curious about the person
- You never judge
- You speak casually like a friend

Example good responses:
"That sounds exhausting. What's been weighing on you the most?"
"Honestly that makes total sense. How are you holding up?"
"You've been carrying a lot. Want to talk about what started it?"
"That's really tough. How long has it been feeling this way?"`;

const CRISIS_KEYWORDS = ['kill myself', 'suicide', 'die', 'self harm', 'hurt myself'];
const CRISIS_RESPONSE = "You matter so much. Please call iCall at 9152987821 right now. I'm here with you.";

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const model = ModelManager.getLoadedModel(ModelCategory.Language);
    setModelReady(!!model);
    if (!model) {
      const interval = setInterval(() => {
        const m = ModelManager.getLoadedModel(ModelCategory.Language);
        if (m) {
          setModelReady(true);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const isCrisisMessage = (text: string): boolean => {
    return CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
  };

  const saveToHistory = (userSaid: string, serenioSaid: string) => {
    const entry = {
      time: new Date().toLocaleString(),
      userSaid,
      serenioSaid,
      mood: null,
    };
    const existing = JSON.parse(localStorage.getItem('serenio-history') || '[]');
    existing.unshift(entry);
    localStorage.setItem('serenio-history', JSON.stringify(existing));
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating || !modelReady) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setGenerating(true);

    const assistantIdx = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

    if (isCrisisMessage(text)) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { role: 'assistant', text: CRISIS_RESPONSE };
        return updated;
      });
      saveToHistory(text, CRISIS_RESPONSE);
      setGenerating(false);
      return;
    }

    try {
      const model = ModelManager.getLoadedModel(ModelCategory.Language);
      if (!model) throw new Error('Language model not loaded');

      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${text}\nSerenio:`;

      const { stream, result: resultPromise } = await TextGeneration.generateStream(fullPrompt, {
        maxTokens: 60,
        temperature: 0.7,
      });

      let accumulated = '';
      for await (const token of stream) {
        accumulated += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = { role: 'assistant', text: accumulated };
          return updated;
        });
      }

      const result = await resultPromise;
      const finalText = result.text || accumulated;

      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { role: 'assistant', text: finalText };
        return updated;
      });

      saveToHistory(text, finalText);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { role: 'assistant', text: 'Something went wrong. Please try again.' };
        return updated;
      });
      console.error('Chat error:', msg);
    } finally {
      setGenerating(false);
    }
  }, [input, generating, messages.length, modelReady]);

  return (
    <div className="tab-panel chat-panel">
      {!modelReady && (
        <div style={{
          padding: '12px',
          background: 'rgba(244,162,97,0.1)',
          border: '1px solid rgba(244,162,97,0.3)',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#F4A261',
          fontSize: '13px',
        }}>
          ⏳ Serenio is getting ready... please wait
        </div>
      )}

      <div className="message-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <h3>💬 Chat with Serenio</h3>
            <p>Hi, I'm here to listen. How are you feeling today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-bubble">
              <p>{msg.text || '...'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Share what's on your mind..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          disabled={generating || !modelReady}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim() || generating || !modelReady}
        >
          {generating ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}