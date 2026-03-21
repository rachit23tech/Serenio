/**
 * Sidebar.tsx
 * Dark mode: active pill = muted teal (matches orb), NOT orange
 * Light mode: active pill = orange (unchanged)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";

export type ActivePage = "home" | "chat" | "mood" | "history";
interface SidebarProps { active: ActivePage; }

const NAV_ITEMS: { id: ActivePage; label: string; path: string; icon: React.ReactNode }[] = [
  { id: "home",    label: "Home",    path: "/home",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { id: "chat",    label: "Chat",    path: "/session",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> },
  { id: "mood",    label: "Mood",    path: "/mood",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { id: "history", label: "History", path: "/history",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 26, borderRadius: 999, flexShrink: 0,
      background: on ? "#68A8A8" : "#D1CBC3",
      border: "none", outline: "none", cursor: "pointer",
      position: "relative", transition: "background 0.25s", padding: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, width: 20, height: 20,
        left: on ? 21 : 3, borderRadius: "50%", background: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.25s", display: "block",
      }} />
    </button>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { dark, toggleDark } = useTheme();
  const t = getTheme(dark);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "fixed", zIndex: 50, top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", width: "100%", maxWidth: 400,
        borderRadius: 20, background: t.card, padding: "28px 28px 24px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", border: `1px solid ${t.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: 0, fontFamily: "'Nunito',sans-serif" }}>Settings</h2>
            <p style={{ fontSize: 13, color: t.textMuted, margin: "4px 0 0", fontFamily: "'Nunito',sans-serif" }}>Customize your Serenio experience</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", background: t.bg,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: t.textMuted, flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ height: 1, background: t.border, marginBottom: 20 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: 0, fontFamily: "'Nunito',sans-serif" }}>Dark Mode</p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "3px 0 0", fontFamily: "'Nunito',sans-serif" }}>{dark ? "Currently on" : "Currently off"}</p>
          </div>
          <Toggle on={dark} onToggle={toggleDark} />
        </div>
        <p style={{ fontSize: 12, color: t.textHint, textAlign: "center", marginTop: 24, fontFamily: "'Nunito',sans-serif" }}>More settings coming soon</p>
      </div>
    </>
  );
}

export default function Sidebar({ active }: SidebarProps) {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const t = getTheme(dark);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
        display: "flex", flexDirection: "column",
        background: t.sidebar, borderRight: `1px solid ${t.border}`, zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ padding: "32px 28px 24px", flexShrink: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: 0, fontFamily: "'Nunito',sans-serif" }}>
            Serenio
          </h1>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.path)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 16,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                textAlign: "left", width: "100%",
                // Dark: teal-navy pill. Light: orange pill
                background: isActive ? t.navActiveBg : "transparent",
                color: isActive ? t.navActiveText : t.textMuted,
                border: "none", outline: "none", transition: "all 0.15s",
                fontFamily: "'Nunito',sans-serif",
              }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = t.navHoverBg;
                    b.style.color = t.navHoverText;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = "transparent";
                    b.style.color = t.textMuted;
                  }
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Settings pinned */}
        <div style={{ padding: "16px 16px 32px", flexShrink: 0, borderTop: `1px solid ${t.border}` }}>
          <button onClick={() => setShowSettings(true)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: 16,
            fontSize: 14, fontWeight: 500, cursor: "pointer",
            width: "100%", textAlign: "left",
            background: "transparent", color: t.textMuted,
            border: "none", outline: "none", transition: "all 0.15s",
            fontFamily: "'Nunito',sans-serif",
          }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = t.navHoverBg; b.style.color = t.navHoverText; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = t.textMuted; }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}