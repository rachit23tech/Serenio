/**
 * VentingSpace.tsx - No-judgment venting mode
 * Route: /venting
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function VentingSpace() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const navigate = useNavigate();
  const { activeVentingSession, startVenting, endVenting } = useWellness();
  const [ventText, setVentText] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (sessionStarted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [sessionStarted]);

  const handleStart = () => {
    startVenting();
    setSessionStarted(true);
  };

  const handleEnd = () => {
    endVenting();
    setVentText('');
    setSessionStarted(false);
  };

  const handleDone = () => {
    handleEnd();
    navigate('/');
  };

  if (!sessionStarted && !activeVentingSession) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
        <Sidebar active="venting" />
        <main style={{
          flex: 1,
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}>
          <div style={{
            maxWidth: 600,
            textAlign: 'center',
            background: t.card,
            borderRadius: 24,
            padding: '48px 40px',
            border: `1px solid ${t.border}`,
            boxShadow: t.cardShadow,
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: dark ? 'rgba(139,92,246,0.15)' : '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              margin: '0 auto 24px',
            }}>
              💭
            </div>

            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 16px',
              fontFamily: 'var(--font-sans)',
            }}>
              No-Judgment Venting Space
            </h1>

            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: t.textMuted,
              margin: '0 0 32px',
              fontFamily: 'var(--font-sans)',
            }}>
              Sometimes you just need to let it all out. This is your private space to vent freely without any advice, judgment, or saving the conversation.
            </p>

            <div style={{
              background: dark ? 'rgba(139,92,246,0.1)' : '#F5F3FF',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 32,
              textAlign: 'left',
            }}>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#8B5CF6',
                margin: '0 0 12px',
                fontFamily: 'var(--font-sans)',
              }}>
                What happens here:
              </p>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                color: t.textMuted,
                fontSize: 14,
                lineHeight: 1.8,
                fontFamily: 'var(--font-sans)',
              }}>
                <li>I won't give advice unless you ask</li>
                <li>I'll just acknowledge and validate</li>
                <li>Nothing is saved to your history</li>
                <li>100% private, 100% judgment-free</li>
                <li>You can end anytime</li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              style={{
                padding: '16px 32px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}
            >
              Start Venting
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="venting" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}>
        {/* Header */}
        <div style={{
          background: dark ? 'rgba(139,92,246,0.1)' : '#F5F3FF',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${dark ? 'rgba(139,92,246,0.2)' : '#E9D5FF'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>💭</span>
            <div>
              <p style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#8B5CF6',
                margin: 0,
                fontFamily: 'var(--font-sans)',
              }}>
                Venting Mode Active
              </p>
              <p style={{
                fontSize: 13,
                color: t.textMuted,
                margin: 0,
                fontFamily: 'var(--font-sans)',
              }}>
                Let it all out. Nothing will be judged or saved.
              </p>
            </div>
          </div>

          <button
            onClick={handleDone}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: dark ? 'rgba(255,255,255,0.1)' : 'white',
              color: t.textPrimary,
              border: `1px solid ${t.border}`,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            I'm Done Venting
          </button>
        </div>

        {/* Writing Area */}
        <div style={{
          flex: 1,
          background: t.card,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          boxShadow: t.cardShadow,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <textarea
            ref={textareaRef}
            value={ventText}
            onChange={(e) => setVentText(e.target.value)}
            placeholder="Just start typing whatever you're feeling... no filter, no judgment. This is YOUR space."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: t.textPrimary,
              fontSize: 16,
              lineHeight: 1.7,
              fontFamily: 'var(--font-sans)',
              resize: 'none',
              padding: 0,
            }}
          />

          {ventText.length > 0 && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${t.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <p style={{
                fontSize: 13,
                color: t.textMuted,
                margin: 0,
                fontFamily: 'var(--font-sans)',
              }}>
                {ventText.split(' ').filter(Boolean).length} words written
              </p>

              <button
                onClick={() => setVentText('')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: t.textMuted,
                  border: `1px solid ${t.border}`,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Supportive Message */}
        {ventText.length > 100 && (
          <div style={{
            marginTop: 16,
            background: dark ? 'rgba(34,197,94,0.1)' : '#F0FDF4',
            borderRadius: 12,
            padding: '16px 20px',
            border: `1px solid ${dark ? 'rgba(34,197,94,0.2)' : '#BBF7D0'}`,
          }}>
            <p style={{
              fontSize: 14,
              color: '#16A34A',
              margin: 0,
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6,
            }}>
              💚 I hear you. Whatever you're feeling is valid. Take all the time you need.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
