import { useState, useRef, useCallback, useEffect } from 'react';
import { generateCompanionReply } from '../lib/companion';
import { detectCrisis, getCrisisResources } from '../lib/crisisDetection';
import { useModelCache } from '../context/ModelCacheContext';
import { useWellness } from '../context/WellnessContext';
import { showNotification } from '../lib/notificationSystem';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  emotion?: string;
  crisisDetected?: boolean;
}

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showCrisisPanel, setShowCrisisPanel] = useState(false);
  const { chatReady } = useModelCache();
  const { addMessage, conversationContext, updateCrisisLevel, analyzeSentiment } = useWellness();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
    if (!text || generating || !chatReady) return;

    setInput('');
    
    // Detect crisis BEFORE adding message
    const crisisResult = detectCrisis(text);
    const sentiment = analyzeSentiment(text);
    
    // Update crisis level in wellness context
    if (crisisResult.level !== 'none') {
      updateCrisisLevel({
        level: crisisResult.level,
        detectedKeywords: crisisResult.detectedKeywords,
        timestamp: new Date(),
      });
    }

    // Add to messages with crisis flag
    setMessages((prev) => [...prev, { 
      role: 'user', 
      text,
      crisisDetected: crisisResult.level !== 'none',
    }]);
    
    // Add to conversation memory
    addMessage('user', text, sentiment.emotions[0]?.emotion);
    
    setGenerating(true);

    const assistantIdx = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

    // Handle severe/moderate crisis
    if (crisisResult.level === 'severe' || crisisResult.level === 'moderate') {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { 
          role: 'assistant', 
          text: crisisResult.message,
          crisisDetected: true,
        };
        return updated;
      });
      setShowCrisisPanel(true);
      saveToHistory(text, crisisResult.message);
      addMessage('assistant', crisisResult.message);
      
      // Send crisis notification
      showNotification({
        type: 'crisis_followup',
        title: '🚨 Crisis Support Resources',
        body: 'Important resources are available. Please check them.',
      });
      
      setGenerating(false);
      return;
    }

    // Handle mild distress
    if (crisisResult.level === 'mild') {
      const supportMessage = crisisResult.message;
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { 
          role: 'assistant', 
          text: supportMessage 
        };
        return updated;
      });
      saveToHistory(text, supportMessage);
      addMessage('assistant', supportMessage);
      setGenerating(false);
      return;
    }

    try {
      // Build context-aware prompt with conversation history
      const recentContext = conversationContext.recentMessages
        .slice(0, 5)
        .reverse()
        .map(m => `${m.role === 'user' ? 'User' : 'Serenio'}: ${m.text}`)
        .join('\n');

      // Use optimized companion reply with streaming
      const result = await generateCompanionReply(text, {
        context: recentContext || undefined,
        stream: true,
        onToken: (_token: string, sanitized: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = { role: 'assistant', text: sanitized };
            return updated;
          });
        },
      });

      saveToHistory(text, result.text);
      addMessage('assistant', result.text);

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
  }, [input, messages.length, generating, chatReady, conversationContext, addMessage, updateCrisisLevel, analyzeSentiment]);

  const resources = getCrisisResources();

  return (
    <div className="tab-panel chat-panel">
      {!chatReady && (
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

      {/* Crisis Panel */}
      {showCrisisPanel && (
        <div style={{
          padding: '16px',
          background: 'rgba(239,68,68,0.1)',
          border: '2px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#DC2626', 
                margin: '0 0 12px',
                fontFamily: 'var(--font-sans)',
              }}>
                🚨 Crisis Support Resources
              </p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {resources.immediate.map((resource, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '8px',
                  }}>
                    <p style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#1F2937', 
                      margin: '0 0 2px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {resource.name}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6B7280', 
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {resource.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowCrisisPanel(false)}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Conversation Context Indicator */}
      {conversationContext.recentMessages.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#6366F1',
          fontFamily: 'var(--font-sans)',
        }}>
          💭 I remember our conversation ({conversationContext.recentMessages.length} messages)
        </div>
      )}

      <div className="message-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <h3>💬 Chat with Serenio</h3>
            <p>Hi{conversationContext.userName ? ` ${conversationContext.userName}` : ''}, I'm here to listen. How are you feeling today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-bubble" style={{
              borderLeft: msg.crisisDetected ? '3px solid #DC2626' : undefined,
            }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text || '...'}</p>
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
          disabled={generating || !chatReady}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim() || generating || !chatReady}
        >
          {generating ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
