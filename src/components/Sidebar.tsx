import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";
import { exportData, importData, getStorageEstimate } from "../utils/exportImport";
import {
  Home,
  MessageSquare,
  Wind,
  HeartPulse,
  Target,
  Smile,
  BookOpen,
  Settings,
  Menu,
  X,
  Download,
  Upload,
  Lightbulb,
  Shield,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";

export type ActivePage = "home" | "chat" | "mood" | "history" | "exercises" | "wellness" | "reminders" | "goals" | "venting";
interface SidebarProps { active: ActivePage; }

const NAV_ITEMS: { id: ActivePage; label: string; path: string; icon: React.ReactNode }[] = [
  { id: "home",    label: "Home",    path: "/home",     icon: <Home className="w-5 h-5" /> },
  { id: "chat",    label: "Chat",    path: "/session",  icon: <MessageSquare className="w-5 h-5" /> },
  { id: "venting", label: "Venting", path: "/venting",  icon: <Wind className="w-5 h-5" /> },
  { id: "wellness", label: "Wellness Hub", path: "/wellness", icon: <HeartPulse className="w-5 h-5" /> },
  { id: "goals", label: "Goals Hub", path: "/goals",    icon: <Target className="w-5 h-5" /> },
  { id: "mood",    label: "Mood",    path: "/mood",     icon: <Smile className="w-5 h-5" /> },
  { id: "history", label: "History", path: "/history",  icon: <BookOpen className="w-5 h-5" /> },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [region, setRegion] = useState(() => localStorage.getItem('serenio-helpline-region') || 'IN');
  const [storageUsed, setStorageUsed] = useState<string>('Calculating...');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    getStorageEstimate().then(res => setStorageUsed(res.formattedUsed));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    localStorage.setItem('serenio-helpline-region', newRegion);
    window.dispatchEvent(new Event('serenio-region-changed'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setStatusMsg({ text: `Successfully restored ${res.count} data categories! Reloading...` });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatusMsg({ text: res.error || "Failed to import", isError: true });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div 
        className="fade-enter"
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: -1,
          backdropFilter: "blur(4px)",
        }} 
        onClick={onClose} 
      />
      <div 
        className="scale-enter"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        style={{
          position: "relative", zIndex: 101,
          width: 440, maxWidth: "90vw", background: t.card, borderRadius: 24,
          padding: 32, border: `1px solid ${t.border}`,
          boxShadow: "0 25px 50px -15px rgba(0,0,0,0.4)",
          maxHeight: "85vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, margin: 0, fontFamily: "var(--font-sans)" }}>
            Settings & Preferences
          </h2>
          <button 
            onClick={onClose} 
            aria-label="Close settings"
            className="hover-scale focus-ring"
            style={{
              width: 32, height: 32, borderRadius: "50%", background: "transparent",
              border: "none", color: t.textMuted, cursor: "pointer", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div style={{
            padding: "10px 14px", borderRadius: 12, marginBottom: 16, fontSize: 13,
            background: statusMsg.isError ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
            color: statusMsg.isError ? "#EF4444" : "#22C55E",
            border: `1px solid ${statusMsg.isError ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {statusMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {statusMsg.text}
          </div>
        )}
        
        <div style={{ height: 1, background: t.border, marginBottom: 20, opacity: 0.6 }} />

        {/* Dark Mode */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: 0, fontFamily: "var(--font-sans)" }}>
              Dark Theme
            </p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0", fontFamily: "var(--font-sans)" }}>
              {dark ? "Switch to light visual mode" : "Switch to dark visual mode"}
            </p>
          </div>
          <Toggle on={dark} onToggle={toggleDark} />
        </div>

        <div style={{ height: 1, background: t.border, margin: "16px 0", opacity: 0.4 }} />

        {/* Region Helpline Selector */}
        <div style={{ padding: "8px 0" }}>
          <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 4, fontFamily: "var(--font-sans)" }}>
            Crisis Helpline Region
          </label>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 8px", fontFamily: "var(--font-sans)" }}>
            Determines emergency contact numbers in the SOS overlay
          </p>
          <select
            value={region}
            onChange={(e) => handleRegionChange(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 12,
              background: dark ? "#1E293B" : "#F1F5F9",
              color: t.textPrimary, border: `1px solid ${t.border}`,
              fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", cursor: "pointer",
            }}
          >
            <option value="IN">India (Tele-MANAS, iCall, Vandrevala, AASRA)</option>
            <option value="US">US & Canada (988 Crisis Lifeline)</option>
            <option value="UK">United Kingdom (111 / Samaritans 116 123)</option>
            <option value="INT">International (Befrienders / General)</option>
          </select>
        </div>

        <div style={{ height: 1, background: t.border, margin: "16px 0", opacity: 0.4 }} />

        {/* Data Backup & Restore */}
        <div style={{ padding: "8px 0" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: "0 0 4px", fontFamily: "var(--font-sans)" }}>
            On-Device Data & Storage
          </p>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px", fontFamily: "var(--font-sans)" }}>
            Estimated Storage Used: <strong style={{ color: t.textPrimary }}>{storageUsed}</strong>
          </p>
          
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={exportData}
              className="hover-lift focus-ring"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 12,
                background: dark ? "#1E293B" : "#F1F5F9",
                border: `1px solid ${t.border}`, color: t.textPrimary,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover-lift focus-ring"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 12,
                background: dark ? "#1E293B" : "#F1F5F9",
                border: `1px solid ${t.border}`, color: t.textPrimary,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Upload className="w-4 h-4" /> Import JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div style={{ height: 1, background: t.border, margin: "16px 0", opacity: 0.4 }} />

        {/* Non-Clinical Disclaimer */}
        <div style={{
          background: dark ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.8)',
          borderRadius: 14, padding: 14, border: `1px solid ${t.border}`,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Shield className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
          <p style={{ fontSize: 12, color: t.textMuted, margin: 0, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
            <strong>Medical Disclaimer:</strong> Serenio is an AI companion designed for general self-reflection and habit tracking. It does not provide clinical diagnosis or medical treatment. If you are experiencing a crisis, please use the Emergency Help button.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ active }: SidebarProps) {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const t = getTheme(dark);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div 
        className="mobile-header"
        style={{
          display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 60,
          background: t.sidebar, borderBottom: `1px solid ${t.border}`, zIndex: 40,
          padding: "0 16px", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open Navigation Menu"
            style={{
              background: "transparent", border: "none", color: t.textPrimary,
              cursor: "pointer", display: "flex", alignItems: "center",
            }}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: 0, fontFamily: "var(--font-sans)" }}>
            Serenio
          </h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{ background: "transparent", border: "none", color: t.textMuted, cursor: "pointer" }}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`stagger-children sidebar-container ${mobileOpen ? "mobile-drawer-open" : ""}`}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
          display: "flex", flexDirection: "column",
          background: t.sidebar, borderRight: `1px solid ${t.border}`, zIndex: 50,
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "32px 28px 24px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 
            className="scale-enter"
            style={{ 
              fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: 0, 
              fontFamily: "var(--font-sans)" 
            }}
          >
            Serenio
          </h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close-btn"
            style={{ display: "none", background: "transparent", border: "none", color: t.textMuted, cursor: "pointer" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Main Navigation" style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { navigate(item.path); setMobileOpen(false); }} 
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="hover-lift focus-ring"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 16,
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  textAlign: "left", width: "100%",
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
            onClick={() => { setShowSettings(true); setMobileOpen(false); }} 
            aria-label="Settings"
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
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .mobile-close-btn { display: block !important; }
          .sidebar-container {
            transform: translateX(-100%);
          }
          .sidebar-container.mobile-drawer-open {
            transform: translateX(0);
          }
          main, body {
            padding-top: 20px;
          }
        }
      `}</style>
    </>
  );
}
