/**
 * Mood.tsx — Mood check-in
 * Route: /mood
 */

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory, MoodLevel } from "../context/HistoryContext";
import { getTheme } from "../tokens";

const MOODS: { id: MoodLevel; emoji: string; label: string; bg: string; ring: string }[] = [
  { id: "struggling", emoji: "😔", label: "Struggling", bg: "#FFCDD2", ring: "#E57373" },
  { id: "low",        emoji: "😟", label: "Low",        bg: "#FFE0B2", ring: "#FFB74D" },
  { id: "okay",       emoji: "😐", label: "Okay",       bg: "#FFF9C4", ring: "#F9A825" },
  { id: "good",       emoji: "🙂", label: "Good",       bg: "#C8E6C9", ring: "#66BB6A" },
  { id: "great",      emoji: "😊", label: "Great",      bg: "#B2DFDB", ring: "#26A69A" },
];

const QUOTES = [
  "You are allowed to be both a masterpiece and a work in progress.",
  "You don't have to have it all figured out to move forward.",
  "Be gentle with yourself — you are a child of the universe.",
  "Rest is not a reward. It's a requirement.",
  "Your feelings are valid. All of them.",
  "Small steps forward are still steps forward.",
  "You survived 100% of your worst days so far.",
  "Healing is not linear, and that's okay.",
];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
  });
}
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Mood() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { moodLog, logMood } = useHistory();
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [saved, setSaved] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const days = getLast7Days();

  const getMoodForDay = (day: Date) =>
    moodLog.find((m) => m.date.toDateString() === day.toDateString())?.mood ?? null;
  const getMoodEmoji = (mood: MoodLevel | null) =>
    mood ? MOODS.find((m) => m.id === mood)?.emoji ?? "" : "";
  const getMoodBg = (mood: MoodLevel | null) =>
    mood ? MOODS.find((m) => m.id === mood)?.bg ?? "#E0E0E0" : dark ? "#2A2535" : "#F0ECE6";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="mood" />

      <main style={{
        flex: 1, marginLeft: 240,
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "48px 24px 60px", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 580 }}>

          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, margin: "0 0 6px", fontFamily: "'Nunito',sans-serif" }}>
              How are you feeling today?
            </h1>
            <p style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Nunito',sans-serif" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Mood picker */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
            {MOODS.map((m) => {
              const isSelected = selected === m.id;
              return (
                <button key={m.id} onClick={() => { setSelected(m.id); setSaved(false); }} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: m.bg, fontSize: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isSelected ? `0 0 0 3px ${m.ring}, 0 4px 16px ${m.ring}55` : "none",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    opacity: selected && !isSelected ? 0.4 : 1,
                    transition: "all 0.2s",
                  }}>{m.emoji}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? t.textPrimary : t.textMuted, transition: "color 0.2s" }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            {selected && !saved && (
              <button onClick={() => { logMood(selected!); setSaved(true); }} style={{
                padding: "12px 32px", borderRadius: 50, background: t.accent, color: "#FFFFFF",
                fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                boxShadow: t.btnShadow, fontFamily: "'Nunito',sans-serif",
              }}>Save today's mood</button>
            )}
            {saved && <p style={{ fontSize: 14, color: "#66BB6A", fontWeight: 600, fontFamily: "'Nunito',sans-serif" }}>✓ Mood saved!</p>}
          </div>

          {/* 7-day history */}
          <div style={{
            borderRadius: 20, padding: "24px 28px", marginBottom: 20,
            background: t.card, border: `1px solid ${t.border}`, boxShadow: t.cardShadow,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, margin: "0 0 20px", fontFamily: "'Nunito',sans-serif" }}>
              7 Day Mood History
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
              {days.map((day, i) => {
                const mood = getMoodForDay(day);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: getMoodBg(mood), fontSize: 22,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                    }}>{getMoodEmoji(mood)}</div>
                    <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Nunito',sans-serif" }}>
                      {DAY_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote card */}
          <div style={{
            borderRadius: 20, padding: "24px 28px",
            background: dark
              ? "linear-gradient(135deg, #251E3A 0%, #1E2A38 100%)"
              : "linear-gradient(135deg, #F5C4A0 0%, #D4A8C8 100%)",
          }}>
            <p style={{
              fontSize: 17, fontWeight: 400, lineHeight: 1.7,
              color: dark ? "#E8EAF6" : "#2D2820", margin: "0 0 20px", fontFamily: "'Nunito',sans-serif",
            }}>
              <span style={{ fontSize: 28, opacity: 0.35, marginRight: 4, fontFamily: "Georgia,serif" }}>"</span>
              {QUOTES[quoteIdx]}
              <span style={{ fontSize: 28, opacity: 0.35, marginLeft: 4, fontFamily: "Georgia,serif" }}>"</span>
            </p>
            <button onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 50,
              background: dark ? t.card : "#FFFFFF", color: t.textPrimary,
              fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)", fontFamily: "'Nunito',sans-serif",
            }}>✨ New Quote</button>
          </div>

        </div>
      </main>
    </div>
  );
}