/**
 * Sidebar.tsx
 * Dark mode: active pill = muted teal (matches orb), NOT orange
 * Light mode: active pill = orange (unchanged)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";

export type ActivePage = "home" | "chat" | "mood" | "history" | "exercises" | "wellness" | "reminders" | "goals" | "venting";
interface SidebarProps { active: ActivePage; }

const NAV_ITEMS: { id: ActivePage; label: string; path: string; icon: React.ReactNode }[] = [
  { id: "home",    label: "Home",    path: "/home",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { id: "chat",    label: "Chat",    path: "/session",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> },
  { id: "venting", label: "Venting", path: "/venting",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h6m-7.5 8.25h12A2.25 2.25 0 0020.25 17.25V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v10.5A2.25 2.25 0 006 19.5z" /></svg> },
  { id: "wellness", label: "Wellness Hub", path: "/wellness",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { id: "goals", label: "Goals Hub", path: "/goals",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
  { id: "mood",    label: "Mood",    path: "/mood",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg> },
  { id: "history", label: "History", path: "/history",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle} 
      className="hover-scale focus-ring"
      style={{
        width: 44, height: 26, borderRadius: 999, flexShrink: 0,
        background: on ? "#68A8A8" : "#D1CBC3",
        border: "none", outline: "none", cursor: "pointer",
        position: "relative", transition: "all 0.25s ease-out", padding: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, width: 20, height: 20,
        left: on ? 21 : 3, borderRadius: "50%", background: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "all 0.25s ease-out", display: "block",
        transform: on ? 'scale(1.1)' : 'scale(1)',
      }} />
    </button>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { dark, toggleDark } = useTheme();
  const t = getTheme(dark);

  return (
    <>
      <div 
        className="fade-enter"
        style={{
          position: "fixed", 
          inset: 0, 
          background: "rgba(0,0,0,0.5)", 
          zIndex: 100,
          backdropFilter: "blur(4px)",
        }} 
        onClick={onClose} 
      />
      <div 
        className="scale-enter"
        style={{
          position: "fixed", 
          top: "50%", 
          left: "50%",
          transform: "translate(-50%, -50%)", 
          zIndex: 101,
          width: 380, 
          background: t.card, 
          borderRadius: 20,
          padding: 32, 
          border: `1px solid ${t.border}`,
          boxShadow: "0 25px 50px -15px rgba(0,0,0,0.4)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div 
          className="fade-enter"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: 24 
          }}
        >
          <h2 style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: t.textPrimary, 
            margin: 0, 
            fontFamily: "var(--font-sans)" 
          }}>
            Settings
          </h2>
          <button 
            onClick={onClose} 
            className="hover-scale focus-ring"
            style={{
              width: 32, 
              height: 32, 
              borderRadius: "50%", 
              background: "transparent",
              border: "none", 
              color: t.textMuted, 
              cursor: "pointer",
              fontSize: 18, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              transition: "all 0.15s ease-out",
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ 
          height: 1, 
          background: t.border, 
          marginBottom: 24,
          opacity: 0.6,
        }} />
        
        <div 
          className="slide-up"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "16px 0",
          }}
        >
          <div>
            <p style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: t.textPrimary, 
              margin: 0, 
              fontFamily: "var(--font-sans)" 
            }}>
              Dark Mode
            </p>
            <p style={{ 
              fontSize: 13, 
              color: t.textMuted, 
              margin: "4px 0 0", 
              fontFamily: "var(--font-sans)" 
            }}>
              {dark ? "Switch to light theme" : "Switch to dark theme"}
            </p>
          </div>
          <Toggle on={dark} onToggle={toggleDark} />
        </div>
        
        <div 
          className="fade-enter"
          style={{
            background: dark ? '#1F2937' : '#F8FAFC',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            border: `1px solid ${t.border}`,
          }}
        >
          <p style={{ 
            fontSize: 13, 
            color: t.textMuted, 
            textAlign: "center", 
            margin: 0, 
            fontFamily: "var(--font-sans)",
            lineHeight: 1.5,
          }}>
            💡 More settings and customization options coming soon
          </p>
        </div>
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
      <aside 
        className="stagger-children"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
          display: "flex", flexDirection: "column",
          background: t.sidebar, borderRight: `1px solid ${t.border}`, zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "32px 28px 24px", flexShrink: 0 }}>
          <h1 
            className="scale-enter"
            style={{ 
              fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: 0, 
              fontFamily: "var(--font-sans)" 
            }}
          >
            Serenio
          </h1>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => navigate(item.path)} 
                className="hover-lift focus-ring"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 16,
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  textAlign: "left", width: "100%",
                  // Dark: teal-navy pill. Light: orange pill
                  background: isActive ? t.navActiveBg : "transparent",
                  color: isActive ? t.navActiveText : t.textMuted,
                  border: "none", outline: "none", 
                  transition: "all 0.2s ease-out",
                  fontFamily: "var(--font-sans)",
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = t.navHoverBg;
                    b.style.color = t.navHoverText;
                    b.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = "transparent";
                    b.style.color = t.textMuted;
                    b.style.transform = 'translateX(0)';
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
          <button 
            onClick={() => setShowSettings(true)} 
            className="hover-lift focus-ring"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 16,
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              width: "100%", textAlign: "left",
              background: "transparent", color: t.textMuted,
              border: "none", outline: "none", 
              transition: "all 0.2s ease-out",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = t.navHoverBg;
              b.style.color = t.navHoverText;
              b.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "transparent";
              b.style.color = t.textMuted;
              b.style.transform = 'translateX(0)';
            }}
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
