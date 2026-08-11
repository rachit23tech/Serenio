import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";
import { LifeBuoy, Heart, PhoneCall, Globe, ShieldAlert } from "lucide-react";

interface Helpline {
  name: string;
  number: string;
  desc: string;
}

const REGIONAL_HELPLINES: Record<string, Helpline[]> = {
  IN: [
    { name: "Tele-MANAS",    number: "14416",        desc: "Govt of India 24/7 Mental Health Helpline" },
    { name: "iCall",         number: "9152987821",   desc: "TISS Counselor Support (Mon–Sat 8am–10pm)" },
    { name: "Vandrevala",    number: "1860-2662-345",desc: "24/7 Free Mental Health Helpline" },
    { name: "AASRA",         number: "9820466627",   desc: "24/7 Suicide Prevention Helpline" },
  ],
  US: [
    { name: "Suicide & Crisis Lifeline", number: "988",    desc: "24/7 Free & Confidential Call or Text" },
    { name: "Crisis Text Line",          number: "741741", desc: "Text HOME to 741741 for 24/7 Crisis Support" },
    { name: "Veterans Crisis Line",      number: "988",    desc: "Call 988 and press 1 for Veterans" },
  ],
  UK: [
    { name: "Samaritans",            number: "116 123", desc: "24/7 Free confidential helpline" },
    { name: "NHS Mental Health",     number: "111",     desc: "24/7 Urgent NHS Mental Health Services" },
    { name: "Shout Crisis Text Line",number: "85258",   desc: "Text SHOUT to 85258 for 24/7 crisis support" },
  ],
  INT: [
    { name: "Befrienders Worldwide", number: "116 123", desc: "Global network of emotional support centers" },
    { name: "Emergency Services",    number: "112",     desc: "Universal emergency number in EU & many countries" },
    { name: "Find a Helpline",       number: "988",     desc: "Visit findahelpline.com for local support" },
  ],
};

export default function SOSButton() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState(() => localStorage.getItem('serenio-helpline-region') || 'IN');

  useEffect(() => {
    const updateRegion = () => {
      setRegion(localStorage.getItem('serenio-helpline-region') || 'IN');
    };
    window.addEventListener('serenio-region-changed', updateRegion);
    return () => window.removeEventListener('serenio-region-changed', updateRegion);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const helplines = REGIONAL_HELPLINES[region] || REGIONAL_HELPLINES.IN;

  return (
    <>
      {/* SOS Button — fixed bottom right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency Help and Crisis Helplines"
        className="hover-scale focus-ring"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
          color: "white", fontWeight: 700,
          fontFamily: "var(--font-sans)",
          transition: "transform 0.2s",
        }}
        title="Emergency Help"
      >
        <LifeBuoy className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Crisis Support Helplines"
          style={{
            position: "fixed", inset: 0, zIndex: 1001,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="scale-enter"
            style={{
              background: t.card, borderRadius: 24,
              padding: "32px 28px", maxWidth: 440, width: "100%",
              border: `1px solid ${t.border}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
              maxHeight: "90vh", overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ display: "inline-flex", padding: 12, borderRadius: "50%", background: "rgba(239,68,68,0.1)", color: "#EF4444", marginBottom: 12 }}>
                <Heart className="w-8 h-8 fill-red-500/20" />
              </div>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: t.textPrimary,
                margin: "0 0 6px", fontFamily: "var(--font-sans)",
              }}>
                You are not alone
              </h2>
              <p style={{
                fontSize: 14, color: t.textMuted, margin: 0,
                fontFamily: "var(--font-sans)", lineHeight: 1.5,
              }}>
                Reach out to a trained counselor right now. Free & confidential.
              </p>
            </div>

            {/* Region Label */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: 10, marginBottom: 14,
              background: dark ? "#1E293B" : "#F1F5F9",
              fontSize: 12, color: t.textMuted, fontFamily: "var(--font-sans)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Globe className="w-4 h-4" />
                Region: <strong style={{ color: t.textPrimary }}>{region === 'IN' ? 'India' : region === 'US' ? 'US & Canada' : region === 'UK' ? 'United Kingdom' : 'International'}</strong>
              </span>
              <span style={{ fontSize: 11, color: t.textHint }}>Change in Settings</span>
            </div>

            {/* Helplines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {helplines.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.number.replace(/\s+/g, '')}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", borderRadius: 14, textDecoration: "none",
                    background: dark ? "rgba(239,68,68,0.1)" : "#FEF2F2",
                    border: "1.5px solid rgba(239,68,68,0.25)",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: "#DC2626",
                      margin: "0 0 2px", fontFamily: "var(--font-sans)",
                    }}>
                      {h.name}
                    </p>
                    <p style={{
                      fontSize: 12, color: t.textMuted, margin: 0,
                      fontFamily: "var(--font-sans)",
                    }}>
                      {h.desc}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: "#DC2626",
                      margin: 0, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <PhoneCall className="w-4 h-4" /> {h.number}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="hover-lift focus-ring"
              style={{
                width: "100%", padding: "12px", borderRadius: 50,
                background: t.bg, border: `1px solid ${t.border}`,
                color: t.textMuted, fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
            >
              I'm okay, close this
            </button>
          </div>
        </div>
      )}
    </>
  );
}
