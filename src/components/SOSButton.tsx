/**
 * SOSButton.tsx — Always visible emergency help button
 * Shows crisis helplines when clicked
 */

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";

const HELPLINES = [
  { name: "iCall",         number: "9152987821",  desc: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala",    number: "1860-2662-345", desc: "24/7 helpline" },
  { name: "AASRA",         number: "9820466627",  desc: "24/7 crisis support" },
  { name: "Snehi",         number: "044-24640050", desc: "Mon–Sat, 8am–10pm" },
];

export default function SOSButton() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* SOS Button — fixed bottom right */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
          fontSize: 20, color: "white", fontWeight: 700,
          fontFamily: "var(--font-sans)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        title="Emergency Help"
      >
        🆘
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1001,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: t.card, borderRadius: 24,
              padding: "32px 28px", maxWidth: 420, width: "100%",
              border: `1px solid ${t.border}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 36, margin: "0 0 8px" }}>💙</p>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: t.textPrimary,
                margin: "0 0 8px", fontFamily: "var(--font-sans)",
              }}>
                You are not alone
              </h2>
              <p style={{
                fontSize: 14, color: t.textMuted, margin: 0,
                fontFamily: "var(--font-sans)", lineHeight: 1.6,
              }}>
                Reach out to a trained counselor right now. It's free and confidential.
              </p>
            </div>

            {/* Helplines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {HELPLINES.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.number}`}
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
                      fontSize: 15, fontWeight: 700, color: "#DC2626",
                      margin: 0, fontFamily: "var(--font-sans)",
                    }}>
                      📞 {h.number}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
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


