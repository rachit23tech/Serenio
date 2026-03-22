/**
 * PrivateModeToggle.tsx - Toggle for incognito/private conversations
 */

import { usePrivateMode } from '../context/PrivateModeContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';

interface PrivateModeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function PrivateModeToggle({ className = '', style = {} }: PrivateModeToggleProps) {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { isPrivateMode, togglePrivateMode, getPrivateSessionDuration } = usePrivateMode();

  const duration = getPrivateSessionDuration();

  return (
    <button
      onClick={togglePrivateMode}
      className={`hover-scale focus-ring ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 20,
        background: isPrivateMode 
          ? 'linear-gradient(135deg, #7C3AED, #A855F7)' 
          : `${t.card}`,
        color: isPrivateMode ? 'white' : t.textMuted,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.2s ease-out',
        boxShadow: isPrivateMode 
          ? '0 4px 15px rgba(124, 58, 237, 0.3)' 
          : 'none',
        border: isPrivateMode 
          ? 'none' 
          : `1px solid ${t.border}`,
        ...style,
      }}
      title={isPrivateMode 
        ? `Private mode active (${duration} min) - Messages won't be saved`
        : 'Enable private mode - Messages won\'t be saved to history'
      }
    >
      <span style={{ 
        fontSize: 16,
        filter: isPrivateMode ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'none',
        transition: 'filter 0.2s ease-out',
      }}>
        {isPrivateMode ? '🔒' : '🔓'}
      </span>
      
      <span style={{
        opacity: isPrivateMode ? 1 : 0.8,
        transition: 'opacity 0.2s ease-out',
      }}>
        {isPrivateMode ? 'Private' : 'Private Mode'}
      </span>
      
      {isPrivateMode && duration > 0 && (
        <span style={{
          fontSize: 11,
          opacity: 0.8,
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 6px',
          borderRadius: 8,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {duration}m
        </span>
      )}
    </button>
  );
}

// Compact version for smaller spaces
export function PrivateModeToggleCompact({ className = '', style = {} }: PrivateModeToggleProps) {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { isPrivateMode, togglePrivateMode } = usePrivateMode();

  return (
    <button
      onClick={togglePrivateMode}
      className={`hover-scale focus-ring ${className}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: isPrivateMode 
          ? 'linear-gradient(135deg, #7C3AED, #A855F7)' 
          : `${t.card}`,
        color: isPrivateMode ? 'white' : t.textMuted,
        cursor: 'pointer',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-out',
        boxShadow: isPrivateMode 
          ? '0 4px 15px rgba(124, 58, 237, 0.3)' 
          : 'none',
        border: isPrivateMode 
          ? 'none' 
          : `1px solid ${t.border}`,
        ...style,
      }}
      title={isPrivateMode 
        ? 'Private mode active - Messages won\'t be saved'
        : 'Enable private mode - Messages won\'t be saved to history'
      }
    >
      <span style={{ 
        filter: isPrivateMode ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'none',
        transition: 'filter 0.2s ease-out',
      }}>
        {isPrivateMode ? '🔒' : '🔓'}
      </span>
    </button>
  );
}