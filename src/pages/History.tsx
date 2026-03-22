import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useHistory, MoodLevel } from '../context/HistoryContext';
import { getTheme } from '../tokens';

const MOOD_EMOJI: Record<MoodLevel, string> = {
  struggling: ':(',
  low: ':/',
  okay: ':|',
  good: ':)',
  great: ':D',
};

function formatDate(date: Date): string {
  return `${date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} • ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
}

export default function History() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { sessions, clearHistory } = useHistory();
  const [query, setQuery] = useState('');

  const filteredSessions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return sessions;
    return sessions.filter((session) =>
      [session.userText, session.serenioResponse, session.type, session.mood]
        .join(' ')
        .toLowerCase()
        .includes(value),
    );
  }, [query, sessions]);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="history" />

      <main
        style={{
          flex: 1,
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px 60px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 760 }}>
          <div
            style={{
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, margin: '0 0 6px', fontFamily: 'var(--font-sans)' }}>
                Search History
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.textMuted }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Everything stays on this device
              </div>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: `1px solid ${t.border}`,
                  background: 'transparent',
                  color: t.textMuted,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Clear history
              </button>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything you said or Serenio replied..."
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 16,
                border: `1px solid ${t.border}`,
                background: t.card,
                color: t.textPrimary,
                outline: 'none',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: t.textMuted }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>{sessions.length === 0 ? 'LOG' : 'FIND'}</p>
              <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                {sessions.length === 0 ? 'No sessions yet' : 'No matches found'}
              </p>
              <p style={{ fontSize: 14, marginTop: 4, fontFamily: 'var(--font-sans)' }}>
                {sessions.length === 0
                  ? 'Start a voice or chat session to build your private history here.'
                  : 'Try a different word like anxious, sleep, lonely, or stress.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    borderRadius: 20,
                    padding: '24px 28px',
                    background: t.card,
                    border: `1px solid ${t.border}`,
                    boxShadow: t.cardShadow,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      gap: 16,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 13, color: t.textMuted, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>
                        {formatDate(session.date)}
                      </p>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.accent, fontFamily: 'var(--font-sans)' }}>
                        {session.type === 'voice' ? 'Voice check-in' : 'Chat check-in'}
                      </span>
                    </div>
                    <span style={{ fontSize: 28 }}>{MOOD_EMOJI[session.mood]}</span>
                  </div>

                  <div style={{ height: 1, background: t.divider, marginBottom: 16 }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>
                        You said
                      </p>
                      <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.65, margin: 0, fontFamily: 'var(--font-sans)' }}>
                        {session.userText}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.accent, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>
                        Serenio replied
                      </p>
                      <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.65, margin: 0, fontFamily: 'var(--font-sans)' }}>
                        {session.serenioResponse}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
