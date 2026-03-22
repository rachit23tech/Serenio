/**
 * ActivityTimer.tsx - Timer for mood activities
 * Shows countdown and tracks activity progress
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';

interface ActivityTimerProps {
  durationMinutes: number;
  activityTitle: string;
  activityIcon: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ActivityTimer({
  durationMinutes,
  activityTitle,
  activityIcon,
  onComplete,
  onCancel,
}: ActivityTimerProps) {
  const { dark } = useTheme();
  const t = getTheme(dark);

  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning === false) {
      onComplete();
    }
  }, [secondsLeft, isRunning, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 20,
      }}
    >
      <div
        style={{
          background: t.bg,
          borderRadius: 24,
          padding: 40,
          maxWidth: 400,
          width: '100%',
          border: `1px solid ${t.border}`,
          textAlign: 'center',
        }}
      >
        {/* Activity Info */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>
            {activityIcon} ⏱️
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {activityTitle}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
              margin: 0,
            }}
          >
            ⏳ {durationMinutes} minute activity
          </p>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>

        {/* Timer Display */}
        <div
          style={{
            marginBottom: 32,
            position: 'relative',
            width: 200,
            height: 200,
            margin: '0 auto 32px',
          }}
        >
          {/* Progress Circle Background */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotate(-90deg)',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={t.border}
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray={`${565.48 * (progress / 100)} 565.48`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>

          {/* Timer Text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: t.textPrimary,
                fontFamily: 'monospace',
                letterSpacing: 2,
              }}
            >
              {displayTime}
            </div>
            <p
              style={{
                fontSize: 12,
                color: t.textMuted,
                margin: '4px 0 0',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: '#10B981',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'transparent',
              color: t.textMuted,
              border: `1px solid ${t.border}`,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
        </div>

        {/* Complete Button (appears when timer finishes) */}
        {secondsLeft === 0 && (
          <button
            onClick={onComplete}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#10B981',
              color: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              animation: 'pulse 1s infinite',
            }}
          >
            ✨ Activity Completed!
          </button>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    </div>
  );
}
