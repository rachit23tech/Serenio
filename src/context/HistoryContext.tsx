/**
 * HistoryContext.tsx
 * Stores session history (voice + chat) and mood log in localStorage.
 * No backend, no auth — fully private, on-device only.
 * Usage: const { sessions, addSession, moodLog, logMood } = useHistory();
 */

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type MoodLevel = "struggling" | "low" | "okay" | "good" | "great";

export interface SessionEntry {
  id: string;
  type: "voice" | "chat";
  date: Date;
  mood: MoodLevel;
  userText: string;
  serenioResponse: string;
}

export interface MoodEntry {
  date: Date;
  mood: MoodLevel;
}

interface HistoryContextType {
  sessions: SessionEntry[];
  addSession: (entry: Omit<SessionEntry, "id">) => void;
  moodLog: MoodEntry[];
  logMood: (mood: MoodLevel) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType>({
  sessions: [], addSession: () => {}, moodLog: [], logMood: () => {}, clearHistory: () => {},
});

// Helper to parse dates back from JSON
function parseSessions(raw: string): SessionEntry[] {
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((s: any) => ({ ...s, date: new Date(s.date) }));
  } catch { return []; }
}

function parseMoodLog(raw: string): MoodEntry[] {
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({ ...m, date: new Date(m.date) }));
  } catch { return []; }
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionEntry[]>(() => {
    const saved = localStorage.getItem('serenio-sessions');
    return saved ? parseSessions(saved) : [];
  });

  const [moodLog, setMoodLog] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('serenio-moodlog');
    return saved ? parseMoodLog(saved) : [];
  });

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('serenio-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save mood log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('serenio-moodlog', JSON.stringify(moodLog));
  }, [moodLog]);

  const addSession = (entry: Omit<SessionEntry, "id">) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setSessions((prev) => [newEntry, ...prev]);
  };

  const logMood = (mood: MoodLevel) => {
    const newEntry = { date: new Date(), mood };
    setMoodLog((prev) => [newEntry, ...prev]);
  };

  const clearHistory = () => {
    setSessions([]);
    setMoodLog([]);
    localStorage.removeItem('serenio-sessions');
    localStorage.removeItem('serenio-moodlog');
  };

  return (
    <HistoryContext.Provider value={{ sessions, addSession, moodLog, logMood, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}