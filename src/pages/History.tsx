/**
 * History.tsx — Your Journal
 * Centered layout like Mood page
 * Route: /history
 */

import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory, MoodLevel } from "../context/HistoryContext";
import { getTheme } from "../tokens";

const MOOD_EMOJI: Record<MoodLevel, string> = {
  struggling: "😔", low: "😟", okay: "😐", good: "🙂", great: "😊",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    + " • " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function History() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { sessions } = useHistory();

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="history" />

      {/* Centered like Mood — alignItems center */}
      <main style={{
        flex: 1, marginLeft: 240,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 60px", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 680 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, margin: "0 0 6px", fontFamily: "'Nunito',sans-serif" }}>
              Your Journal
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Only visible to you
            </div>
          </div>

          {/* Empty state */}
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: t.textMuted }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📖</p>
              <p style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Nunito',sans-serif" }}>No sessions yet</p>
              <p style={{ fontSize: 14, marginTop: 4, fontFamily: "'Nunito',sans-serif" }}>
                Start a voice or chat session to see your journal here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sessions.map((session) => (
                <div key={session.id} style={{
                  borderRadius: 20, padding: "24px 28px",
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.cardShadow,
                }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 4px", fontFamily: "'Nunito',sans-serif" }}>
                        {formatDate(session.date)}
                      </p>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.accent, fontFamily: "'Nunito',sans-serif" }}>
                        {session.type === "voice" ? "🎙️ Voice" : "💬 Chat"}
                      </span>
                    </div>
                    <span style={{ fontSize: 28 }}>{MOOD_EMOJI[session.mood]}</span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: t.divider, marginBottom: 16 }} />

                  {/* Content */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, margin: "0 0 4px", fontFamily: "'Nunito',sans-serif" }}>
                        You said:
                      </p>
                      <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.65, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
                        {session.userText}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.accent, margin: "0 0 4px", fontFamily: "'Nunito',sans-serif" }}>
                        Serenio responded:
                      </p>
                      <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.65, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
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