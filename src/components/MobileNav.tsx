/**
 * MobileNav.tsx
 * Shared bottom navigation bar for mobile.
 * Hidden on desktop (lg:).
 */

import { useNavigate } from "react-router-dom";
import { Theme } from "../tokens";

interface MobileNavProps {
  t: Theme;
}

const ITEMS = [
  { icon: "🏠", label: "Home",    path: "/home"    },
  { icon: "💬", label: "Chat",    path: "/session" },
  { icon: "🤍", label: "Mood",    path: "/mood"    },
  { icon: "📖", label: "History", path: "/history" },
];

export default function MobileNav({ t }: MobileNavProps) {
  const navigate = useNavigate();
  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "10px 8px",
        background: t.sidebar,
        borderTop: `1px solid ${t.border}`,
      }}
    >
      {ITEMS.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            fontSize: 11, color: t.textMuted, background: "none", border: "none",
            cursor: "pointer", fontFamily: "'Nunito', sans-serif",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}