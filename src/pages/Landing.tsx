/**
 * Landing.tsx — Splash / welcome screen
 * Route: /
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../tokens";

export default function Landing() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const t = getTheme(dark);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: t.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "48px 24px", position: "relative", overflow: "hidden",
      fontFamily: "'Nunito', sans-serif",
    }}>

      {/* Background ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {dark ? (
          <>
            <div style={{
              position: "absolute", top: -100, left: -80,
              width: 420, height: 420, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(144,144,204,0.1) 0%, transparent 65%)",
              animation: "float 10s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", bottom: -80, right: -60,
              width: 360, height: 360, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(96,190,176,0.08) 0%, transparent 65%)",
              animation: "float 8s ease-in-out infinite", animationDelay: "3s",
            }} />
          </>
        ) : (
          <>
            <div style={{
              position: "absolute", top: -80, left: -60,
              width: 360, height: 360, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,132,90,0.22) 0%, transparent 65%)",
              animation: "float 9s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", bottom: -60, right: -40,
              width: 300, height: 300, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(168,136,170,0.18) 0%, transparent 65%)",
              animation: "float 7s ease-in-out infinite", animationDelay: "3s",
            }} />
          </>
        )}
      </div>

      {/* App name */}
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center", marginBottom: 44,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "all 0.8s ease",
      }}>
        <h1 style={{
          fontSize: 30, fontWeight: 300, letterSpacing: "0.14em",
          color: t.textPrimary, margin: 0,
        }}>
          Serenio
        </h1>
      </div>

      {/* Orb */}
      <div style={{
        position: "relative", zIndex: 1, marginBottom: 40,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.88)",
        transition: "all 1s ease 0.2s",
      }}>
        {/* Soft outer glow ring */}
        <div style={{
          position: "absolute", inset: -44, borderRadius: "50%",
          background: dark
            ? "radial-gradient(circle, rgba(96,190,176,0.15) 0%, rgba(144,144,204,0.1) 45%, transparent 70%)"
            : "radial-gradient(circle, rgba(192,120,136,0.15) 0%, rgba(168,136,170,0.1) 45%, transparent 70%)",
          filter: "blur(18px)",
        }} />
        {/* Orb circle */}
        <div style={{
          width: 200, height: 200, borderRadius: "50%",
          background: t.orbGradient,
          boxShadow: t.orbShadow,
          animation: "breathe 4s ease-in-out infinite",
        }} />
      </div>

      {/* Text + CTA */}
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center", maxWidth: 460,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.9s ease 0.3s",
      }}>
        <h2 style={{
          fontSize: 21, fontWeight: 600, color: t.textPrimary,
          margin: "0 0 10px", lineHeight: 1.4,
        }}>
          Hi, I'm Serenio. I'm here to listen.
        </h2>
        <p style={{
          fontSize: 15, color: t.textMuted,
          margin: "0 0 38px", lineHeight: 1.6,
        }}>
          Your thoughts stay on your device. Always.
        </p>

        {/* CTA button */}
        <button
          onClick={() => navigate("/home")}
          style={{
            display: "block", width: "100%", maxWidth: 340,
            margin: "0 auto 16px",
            padding: "17px 32px", borderRadius: 50,
            fontSize: 16, fontWeight: 600, color: "#FFFFFF",
            border: "none", cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            // Dark = periwinkle→teal gradient (Image 1)
            // Light = solid orange
            background: dark
              ? "linear-gradient(90deg, #9090CC 0%, #7AAAC0 50%, #68C0B8 100%)"
              : "#E8845A",
            boxShadow: dark
              ? "0 8px 30px rgba(96,190,176,0.3), 0 2px 8px rgba(144,144,204,0.25)"
              : "0 8px 28px rgba(232,132,90,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.transform = "translateY(-2px) scale(1.02)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.transform = "translateY(0) scale(1)";
          }}
        >
          Start Listening
        </button>

        {/* Secondary link */}
        <button
          onClick={() => navigate("/mood")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: t.textMuted,
            fontFamily: "'Nunito', sans-serif",
            display: "block", margin: "0 auto 28px",
          }}
        >
          Check my mood first →
        </button>

        {/* Privacy badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, color: t.textHint, fontSize: 13,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          100% Private
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-22px); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}