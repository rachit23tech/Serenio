/**
 * Exercises.tsx - Guided Mental Health Exercises
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';
import ExerciseModal from '../components/ExerciseModal';
import type { GuidedExercise } from '../types/wellness';

const EXERCISE_TYPES: Array<{
  type: GuidedExercise['type'];
  name: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    type: 'cbt',
    name: 'Challenge Negative Thoughts',
    description: 'CBT technique to reframe unhelpful thinking patterns',
    icon: '🧠',
    color: '#8B5CF6',
  },
  {
    type: 'gratitude',
    name: 'Gratitude Practice',
    description: 'Focus on positive aspects of your day',
    icon: '🙏',
    color: '#EC4899',
  },
  {
    type: 'values',
    name: 'Values Clarification',
    description: 'Identify what truly matters to you',
    icon: '⭐',
    color: '#F59E0B',
  },
  {
    type: 'goal',
    name: 'SMART Goal Setting',
    description: 'Set specific, achievable goals',
    icon: '🎯',
    color: '#10B981',
  },
  {
    type: 'sleep',
    name: 'Sleep Hygiene Check',
    description: 'Review and improve sleep habits',
    icon: '😴',
    color: '#6366F1',
  },
  {
    type: 'compassion',
    name: 'Self-Compassion',
    description: 'Practice being kind to yourself',
    icon: '💙',
    color: '#14B8A6',
  },
];

export default function Exercises() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const navigate = useNavigate();
  const { exercises, startExercise } = useWellness();
  const [selectedExercise, setSelectedExercise] = useState<GuidedExercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentExercises = exercises.slice(0, 3);

  const handleStartExercise = (type: GuidedExercise['type']) => {
    const exercise = startExercise(type);
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleResumeExercise = (exercise: GuidedExercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  return (
    <div 
      className="page-container"
      style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}
    >
      <Sidebar active="exercises" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              Guided Exercises
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Evidence-based mental health exercises to build resilience
            </p>
          </div>

          {/* Recent Exercises */}
          {recentExercises.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 16,
                fontFamily: 'var(--font-sans)',
              }}>
                Continue Where You Left Off
              </h2>
              <div style={{ display: 'grid', gap: 16 }}>
                {recentExercises.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      background: t.card,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${t.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleResumeExercise(ex)}
                  >
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {ex.name}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: t.textMuted,
                      margin: '4px 0 0',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {ex.completedAt ? 'Completed' : `Step ${ex.steps.filter(s => s.userInput).length}/${ex.steps.length}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Grid */}
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: t.textPrimary,
            marginBottom: 20,
            fontFamily: 'var(--font-sans)',
          }}>
            Start a New Exercise
          </h2>

          <div 
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {EXERCISE_TYPES.map((exercise) => (
              <button
                key={exercise.type}
                onClick={() => handleStartExercise(exercise.type)}
                className="hover-lift focus-ring"
                style={{
                  background: t.card,
                  borderRadius: 16,
                  padding: 24,
                  border: `1px solid ${t.border}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                  boxShadow: t.cardShadow,
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: dark ? `${exercise.color}22` : `${exercise.color}11`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}>
                  {exercise.icon}
                </div>

                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 8px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {exercise.name}
                </h3>

                <p style={{
                  fontSize: 14,
                  color: t.textMuted,
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
                  {exercise.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
      
      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
